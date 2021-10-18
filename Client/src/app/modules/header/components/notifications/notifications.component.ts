import {
  ACTIVITY_ACTION_TYPES,
  DEFAULT_PRELOADED_IMAGE,
  NOTIFICATION_MENTION,
  NOTIFICATION_STRINGS,
  Notifications,
  SOUNDS
} from '../../../../utils';
import { AppState, STATE_TYPES } from '../../../../store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  HeaderApiService,
  NotificationService,
  NotificationSocketService,
  OpportunityApiService,
  ProfileApiService
} from '../../../../services';
import { concat, forEach, get, map, uniq, uniqBy } from 'lodash';

import { IdeaSummaryComponent } from '../../../idea/components';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RenderNotificationHelper } from '../../../../helpers';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [ProfileApiService, OpportunityApiService]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  notifications: Notifications;
  sum = 100;
  scrollDownDistance = 2;
  isLoading: boolean;
  users;
  counts = 0;
  actionTypes = ACTIVITY_ACTION_TYPES;
  params;
  currentCount = 0;
  actualCounts = 0;
  todayUserProfileImages = {};
  pastUserProfileImages = {};
  public currentUser = this.ngRedux.getState().userState;
  public ideaEntity;
  private sub: Subscription;
  private sub2: Subscription;
  public pastWord = NOTIFICATION_STRINGS;
  public routes = {
    user: 'profile',
    idea: 'idea'
  };

  constructor(
    private router: Router,
    private profileApi: ProfileApiService,
    private modalService: NgbModal,
    private headerApi: HeaderApiService,
    private ngRedux: NgRedux<AppState>,
    private notificationSocket: NotificationSocketService,
    private toast: NotificationService
  ) {
    this.notifications = {
      today: {
        data: [],
        users: null
      },
      past: {
        data: [],
        users: null
      }
    };
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.params = {
      take: 10,
      skip: this.currentCount
    };
    this.currentCount += 10;

    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        if (state.user.id && state.currentCommunityId) {
          this.getNotifications();
          // Socket
          if (this.sub2) {
            this.sub2.unsubscribe();
          }
          const socketKey = `activity-log-notification-${state.user.id}-${state.currentCommunityId}`;
          this.sub2 = this.notificationSocket
            .fromEvent(socketKey)
            .subscribe((res: any) => {
              this.popup();
              this.counts++;
              this.actualCounts++;
              this.notifications.today.data.unshift(get(res, 'activityLog'));
              this.notifications.today.data = uniqBy(
                this.notifications.today.data,
                'id'
              );
              this.pushedNotificationImages();
            });
        }
      });
  }

  popup() {
    // new Audio(SOUNDS.NOTIFICATION).play();
    this.toast.showInfo('New notification received', {
      progressBar: false,
      positionClass: 'toast-bottom-right'
    });
  }

  async pushedNotificationImages() {
    this.notifications.today.users = uniq(
      map(this.notifications.today.data, (n) => n.actorUserId)
    );
    this.todayUserProfileImages = await this.getUserImages(
      this.notifications.today.users
    );
  }

  private async getNotifications() {
    this.isLoading = true;
    const r: any = await this.headerApi
      .getNotifications(this.params)
      .toPromise();

    if (r) {
      const response = r.response;
      this.counts = response.unreadCount
        ? parseInt(response.unreadCount, 10)
        : 0;
      this.actualCounts = response.count ? parseInt(response.count, 10) : 0;

      this.notifications.today.data = uniqBy(
        concat(this.notifications.today.data, get(response, 'today', [])),
        'id'
      );

      this.notifications.past.data = uniqBy(
        concat(this.notifications.past.data, get(response, 'past', [])),
        'id'
      );

      this.notifications.today.users = uniq(
        map(this.notifications.today.data, (n) => n.actorUserId)
      );

      this.notifications.past.users = uniq(
        map(this.notifications.past.data, (n) => n.actorUserId)
      );

      this.todayUserProfileImages = await this.getUserImages(
        this.notifications.today.users
      );

      if (this.notifications.past.users.length) {
        this.pastUserProfileImages = await this.getUserImages(
          this.notifications.past.users
        );
      }
    }
    this.isLoading = false;
  }

  markRead(notification) {
    if (!notification.isRead) {
      this.headerApi
        .markNotificationAsRead([notification.id])
        .subscribe(() => (notification.isRead = 1));
      this.counts--;
    }
    this.redirection(notification);
  }

  async markAllAsRead(status) {
    if (!status) {
      const notArr = [
        ...map(
          this.notifications.today.data,
          (notification) => notification.id
        ),
        ...map(this.notifications.past.data, (notification) => notification.id)
      ];
      this.counts = 0;
      await this.headerApi.markNotificationAsRead(notArr).toPromise();
      forEach(
        this.notifications.past.data,
        (notification) => (notification.isRead = 1)
      );
      forEach(
        this.notifications.today.data,
        (notification) => (notification.isRead = 1)
      );
    }
  }

  getLinkToRedirect(notification) {
    if (notification.entityName === 'idea') {
      return `/${notification.entityName}/${notification.entityObjectId}`;
    } else if (notification.entityName === 'challenge') {
      return `/challenges/view/${notification.entityObjectId}`;
    }
  }

  redirection(notification) {
    let queryParams = {};
    if (notification.entityName !== 'challenge') {
      const action = get(notification, 'actionType.abbreviation', false);
      if (action === this.actionTypes.comment) {
        const commentId = get(
          notification,
          'entityOperendObject.comment.id',
          null
        );
        const scrollTo = commentId ? `comment${commentId}` : 'allComments';
        queryParams = { scrollTo };
        this.router.navigate(['/idea/view/', notification.entityObjectId], {
          queryParams
        });
      } else if (action === this.actionTypes.mention) {
        let scrollTo = NOTIFICATION_MENTION.type.opportunityDescription;
        if (
          get(notification, 'entityOperendObject.type') ===
          NOTIFICATION_MENTION.type.opportunityDescription
        ) {
          scrollTo = NOTIFICATION_MENTION.type.opportunityDescription;
        } else if (
          get(notification, 'entityOperendObject.type') ===
          NOTIFICATION_MENTION.type.comment
        ) {
          const commentId = get(
            notification,
            'entityOperendObject.entity.id',
            null
          );
          scrollTo = commentId ? `comment${commentId}` : 'allComments';
        }
        queryParams = { scrollTo };
        this.router.navigate(['/idea/view/', notification.entityObjectId], {
          queryParams
        });
      } else if (action === this.actionTypes.upvote) {
        if (
          get(notification, 'entityOperendObject.type') ===
          NOTIFICATION_MENTION.type.comment
        ) {
          const commentId = get(
            notification,
            'entityOperendObject.entity.id',
            null
          );
          const scrollTo = commentId ? `comment${commentId}` : 'allComments';
          queryParams = { scrollTo };
          this.router.navigate(['/idea/view/', notification.entityObjectId], {
            queryParams
          });
        } else {
          this.openSummaryModal(notification.entityObjectId);
        }
      } else if (
        action === this.actionTypes.follow ||
        action === this.actionTypes.view ||
        action === this.actionTypes.edit ||
        action === this.actionTypes.add_workflow ||
        action === this.actionTypes.change_workflow ||
        action === this.actionTypes.change_stage
      ) {
        this.openSummaryModal(notification.entityObjectId);
      } else {
        this.router.navigate(['/idea/view/', notification.entityObjectId], {
          queryParams
        });
      }
    } else if (notification.entityName === 'challenge') {
      this.router.navigate(['/challenges/view/', notification.entityObjectId]);
    }
  }

  getUserImages(ids) {
    if (ids.length) {
      return this.profileApi
        .getBulkProfileImages(ids)
        .toPromise()
        .then((res: any) => res.response);
    }
    return [];
  }

  isActionType(notification, actionTypes) {
    return get(notification, 'actionType.abbreviation', false) === actionTypes;
  }

  generateText(notification) {
    const action = get(notification, 'actionType.abbreviation', false);
    switch (action) {
      case this.actionTypes.add_owner:
        return RenderNotificationHelper.addOwner(notification);
      case this.actionTypes.remove_owner:
        return RenderNotificationHelper.removeOwner(notification);
      case this.actionTypes.add_contributor:
        return RenderNotificationHelper.addContributor(notification);
      case this.actionTypes.remove_contributor:
        return RenderNotificationHelper.removeContributor(notification);
      case this.actionTypes.add_submitter:
        return RenderNotificationHelper.addSubmitter(notification);
      case this.actionTypes.remove_submitter:
        return RenderNotificationHelper.removeSubmitter(notification);
      case this.actionTypes.award_prize:
        return RenderNotificationHelper.awardPrize(notification);
      case this.actionTypes.share:
        return RenderNotificationHelper.shareOpportunity(notification);
      case this.actionTypes.mention:
        return RenderNotificationHelper.userAndGroupMention(notification);
      case this.actionTypes.add_workflow:
        return RenderNotificationHelper.addWorkflow(notification);
      case this.actionTypes.change_workflow:
        return RenderNotificationHelper.changeWorkflow(notification);
      case this.actionTypes.change_stage:
        return RenderNotificationHelper.changeStage(notification);
      case this.actionTypes.upvote:
        return RenderNotificationHelper.upVoted(notification);
      default:
        return RenderNotificationHelper.general(notification);
    }
  }

  aggregatedNotification(notification) {
    let html = '';
    for (let i = 1; i <= 2; i++) {
      if (notification.aggregatedData[i - 1]) {
        html += `<b>${notification.aggregatedData[i - 1].userName}</b>`;
        if (notification.aggregatedData.length === 1 || i === 2) {
          html += '&nbsp;';
        } else if (i === 1 && notification.aggregatedCount === 2) {
          html += '&nbsp;and&nbsp;';
        } else if (i === 1 && notification.aggregatedCount > 2) {
          html += ',&nbsp;';
        }
      }
    }

    if (notification.aggregatedCount > notification.aggregatedData.length) {
      html += `and ${
        notification.aggregatedCount - notification.aggregatedData.length
      } others&nbsp;`;
    }
    html += `${this.pastWord[notification.actionType.abbreviation]}
    ${notification.entityName} [#${notification.entityId}] ${
      notification.entityTitle
    }`;
    return html;
  }

  openSummaryModal(ideaId) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.switchStageTab = false;
    modalRef.componentInstance.ideaId = ideaId;
  }

  isAutoGenerated(notification) {
    return get(notification, 'entityOperendObject.autogenerated', false);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }
}
