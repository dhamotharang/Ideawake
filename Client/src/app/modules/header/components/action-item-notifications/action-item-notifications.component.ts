import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RenderActionItemsHelper } from '../../../../helpers';
import {
  ActionItemSocketService,
  HeaderApiService,
  NotificationService
} from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import {
  ACTION_ITEM_ICONS,
  ACTION_ITEM_INFO,
  IDEA_TABS,
  SOUNDS,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';

@Component({
  selector: 'app-action-item-notifications',
  templateUrl: './action-item-notifications.component.html',
  styleUrls: ['./action-item-notifications.component.scss']
})
export class ActionItemsNotificationComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  itemsList = [];
  actionItemIcons = ACTION_ITEM_ICONS;
  scrollDownDistance = 2;
  isLoading: boolean;
  counts = 0;
  params;
  currentCount = 0;
  actualCounts = 0;
  public currentUser = this.ngRedux.getState().userState;
  private sub: Subscription;
  private sub2: Subscription;

  constructor(
    private router: Router,
    private socket: ActionItemSocketService,
    private headerApi: HeaderApiService,
    private ngRedux: NgRedux<AppState>,
    private toast: NotificationService
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.params = {
      take: 10,
      skip: this.currentCount,
      status: 'open'
    };
    this.currentCount += 10;
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: UserState) => {
        if (state.user.id && state.currentCommunityId) {
          this.params.community = state.currentCommunityId;
          this.getActionItems();
          // Socket
          if (this.sub2) {
            this.sub2.unsubscribe();
          }
          const socketKey = `action-item-log-${state.user.id}-${state.currentCommunityId}`;
          this.sub2 = this.socket.fromEvent(socketKey).subscribe((res: any) => {
            if (_.get(res, 'refreshRequired')) {
              this.itemsList = [];
              this.getActionItems();
            } else if (_.get(res, 'actionItemLog')) {
              this.popup();
              this.counts++;
              this.actualCounts++;
              this.itemsList.unshift(_.get(res, 'actionItemLog'));
              this.itemsList = _.uniqBy(this.itemsList, 'id');
            }
          });
        }
      });
  }

  popup() {
    new Audio(SOUNDS.ACTION_ITEM).play();
    this.toast.showInfo('Alerts.NewActionItem', {
      progressBar: false,
      positionClass: 'toast-bottom-right'
    });
  }

  private getActionItems() {
    this.isLoading = true;
    this.headerApi.getActionItems(this.params).subscribe(
      (res: any) => {
        const response = res.response;
        const actionItemLogs = _.get(response, 'actionItemLogs', []);
        if (actionItemLogs.length) {
          this.itemsList = _.uniqBy(
            _.concat(this.itemsList, actionItemLogs),
            'id'
          );
        }
        this.counts = response.unreadCount;
        this.actualCounts = _.get(response, 'totalCount', 0);
        this.isLoading = false;
      },
      (err) => (this.isLoading = false)
    );
  }

  markRead(item) {
    if (!item.isRead) {
      this.headerApi
        .markActionItemAsRead([item.id])
        .subscribe(() => (item.isRead = true));
      this.counts--;
    }
  }

  redirectTo(item) {
    this.router.navigate([`/profile/action-items`], {
      queryParams: { idea: item.entityObjectId }
    });
  }

  getImage(item) {
    return (
      _.get(item, 'entityImageUrl') ||
      'https://ideawake-test.s3.amazonaws.com/attachments/opportunity/1600938858832default.png'
    );
  }

  generateItem(item) {
    const tool = _.get(item, 'actionItemAbbreviation', '');
    if (tool === ACTION_ITEM_INFO.refinement.abbreviation) {
      return RenderActionItemsHelper.refinement(item);
    } else if (tool === ACTION_ITEM_INFO.scorecard.abbreviation) {
      return RenderActionItemsHelper.scoreCard(item);
    } else {
      return RenderActionItemsHelper.general(item);
    }
  }

  isValidDate(date) {
    return moment(date).isValid();
  }

  daysLeft(dateToCheckAgainst) {
    // return moment().to(moment(dateToCheckAgainst));
    const dueDate = moment(dateToCheckAgainst);
    const days = dueDate.diff(moment(), 'days');
    if (days > 1) {
      return `Due in ${days} days`;
    } else if (days === 1) {
      return `Due in ${days} day`;
    } else if (days === 0) {
      return `Due today`;
    } else {
      return `Past due`;
    }
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
