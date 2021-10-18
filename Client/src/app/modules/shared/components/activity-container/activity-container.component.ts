// tslint:disable: triple-equals
// tslint:disable: no-string-literal
import * as _ from 'lodash';
import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityApiService, UtilService } from '../../../../services';
import { AppState } from '../../../../store';
import {
  ACTIVITY_ACTION_TYPES,
  ACTIVITY_ICONS,
  ACTIVITY_PHRASE,
  ACTIVITY_SORTING,
  CURRENT_IDEA_ACTIVITY
} from '../../../../utils';

@Component({
  selector: 'app-activity-container',
  templateUrl: './activity-container.component.html',
  styleUrls: ['./activity-container.component.scss']
})
export class ActivityContainerComponent implements OnInit {
  @Input() entityType = 0;
  @Input() ideaId = 0;
  @Input() challengeId = 0;
  @Input() inModel = false;
  @Output() switchTab = new EventEmitter<any>();
  @Input() colClass = 'col-8';
  @Input() noPadding = false;
  @Input() currentIdea = false;
  isLoading = true;
  public objectKeys = Object.keys;
  public resultCount = 0;
  public counts = {};
  public isSearching = false;
  public activityTypes = [];
  public activities = [];
  public selectedSort = 'DESC';
  public currentUser = this.ngRedux.getState().userState;
  public default: any = {
    orderBy: 'createdAt',
    orderType: this.selectedSort,
    take: 10,
    skip: 0
  };
  public sorting = ACTIVITY_SORTING;
  public icons = ACTIVITY_ICONS;
  public actionTypes = ACTIVITY_ACTION_TYPES;
  public pastWord = CURRENT_IDEA_ACTIVITY;

  public resetFilter = { id: null, name: 'All', abbreviation: 'all' };
  public selectedFilter = this.resetFilter;
  constructor(
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private activityApiService: ActivityApiService,
    public util: UtilService
  ) {}

  ngOnInit() {
    this.default['community'] = this.currentUser.currentCommunityId;
    this.default['entityType'] = this.entityType;
    if (this.challengeId) {
      this.default['entityObjectId'] = this.challengeId;
    } else if (this.ideaId) {
      this.default['entityObjectId'] = this.ideaId;
    }
    this.pastWord = this.currentIdea ? CURRENT_IDEA_ACTIVITY : ACTIVITY_PHRASE;
    this.getActivityTypes();
    this.searchActivities(this.default);
  }
  getActivityTypes() {
    this.activityApiService.getActivityTypes().subscribe((res: any) => {
      this.isLoading = true;
      this.activityTypes = res.response;
      this.isLoading = false;
      this.activityTypes.unshift(this.resetFilter);
    });
  }
  searchActivities(param = {}) {
    this.isSearching = true;
    this.activityApiService.searchActivity(param).subscribe(
      (res: any) => {
        this.resultCount = res.response[1];
        this.counts = res.response[2];
        const result = _.first(res.response);
        this.activities = _.concat(this.activities, result);
        this.isSearching = false;
      },
      () => {
        this.isSearching = false;
      }
    );
  }

  filterActivity(type) {
    this.selectedFilter = type;
    this.default.skip = 0;
    this.activities = [];
    if (type.abbreviation === 'all') {
      delete this.default.filterBy;
    } else {
      this.default.filterBy = this.selectedFilter.abbreviation;
    }
    this.searchActivities(this.default);
  }

  sort(type) {
    this.selectedSort = type;
    this.default.orderType = type;
    this.default.skip = 0;
    this.activities = [];
    this.searchActivities(this.default);
  }
  loadMore() {
    this.default.skip = _.get(this.activities, 'length', 0);
    this.searchActivities(this.default);
  }

  isThisMe(id) {
    return this.currentUser.user.id == id ? true : false;
  }

  getUserName(activity) {
    if (
      this.isThisMe(activity.userId) &&
      activity.userId == activity.actorUserId
    ) {
      return 'yourself';
    } else if (
      this.isThisMe(activity.userId) &&
      activity.userId != activity.actorUserId
    ) {
      return 'you';
    } else if (
      !this.isThisMe(activity.userId) &&
      activity.userId == activity.actorUserId
    ) {
      return 'himself';
    } else {
      return activity.userName;
    }
  }

  getValue(object, str) {
    return _.get(object, str, false);
  }

  getMessage(activity) {
    return _.get(activity, 'entityOperendObject.message', false);
  }

  getActionText(activity) {
    const action = _.get(activity, 'actionType.abbreviation', false);
    return _.get(this.pastWord, action, '');
  }

  generateText(activity) {
    return `${this.getActionText(activity)} ${activity.entityName}`;
  }

  generateStackHolderText(activity) {
    const action = _.get(activity, 'actionType.abbreviation', false);
    if (
      action === this.actionTypes.add_owner ||
      action === this.actionTypes.remove_owner
    ) {
      return `as an owner of`;
    } else if (
      action === this.actionTypes.add_contributor ||
      action === this.actionTypes.remove_contributor
    ) {
      return `as a team member on`;
    } else if (
      action === this.actionTypes.add_submitter ||
      action === this.actionTypes.remove_submitter
    ) {
      return `as a co-submitter on`;
    }
  }

  aggregatedActivity(activity) {
    const action = _.get(activity, 'actionType.abbreviation', false);
    let html = '';
    for (let i = 1; i <= 2; i++) {
      if (activity.aggregatedData[i - 1]) {
        html += `<a href="/profile/view/${
          activity.aggregatedData[i - 1].userId
        }" class="inverseLinkDark">
                ${
                  this.isThisMe(activity.aggregatedData[i - 1].userId)
                    ? 'You'
                    : activity.aggregatedData[i - 1].userName
                }
               </a>`;
        if (activity.aggregatedData.length === 1 || i === 2) {
          html += '&nbsp;';
        } else if (i === 1 && activity.aggregatedCount === 2) {
          html += '&nbsp;and&nbsp;';
        } else if (i === 1 && activity.aggregatedCount > 2) {
          html += ',&nbsp;';
        }
      }
    }

    if (activity.aggregatedCount > 2) {
      html += `and ${activity.aggregatedCount - 2} others&nbsp;`;
    }
    if (action == this.actionTypes.comment) {
      html += `posted comment on `;
      if (this.currentIdea) {
        html += `this idea`;
      } else {
        html += `<a href="${this.getLinkToRedirect(
          activity
        )}" class="inverseLinkDark">[#${activity.entityObjectId}]</a>`;
      }
      html += `<div>
                <button class="btn btn-light btn-sm" (click)="switchTabToSummary(${activity.entityObjectId})">Reply</button>
              </div>`;
    } else {
      html += `${this.pastWord[action]} `;
      if (!this.currentIdea) {
        html += `${activity.entityName} [#${activity.entityId}] ${activity.entityTitle}`;
      } else {
        html += `${activity.entityName}`;
      }
    }
    return html;
  }

  switchTabToSummary(id) {
    this.switchTab.emit('summary');
    if (!this.currentIdea) {
      this.router.navigate(['/idea/view/', id]);
    }
  }
  getLinkToRedirect(activity) {
    if (activity.entityName === 'challenge') {
      return `/challenges/view/${activity.entityObjectId}`;
    } else {
      return `/idea/view/${activity.entityObjectId}`;
    }
  }

  isAwardeeUser(activity) {
    if (
      _.get(
        activity,
        'entityOperendObject.awardeeEntityType.abbreviation',
        false
      ) === 'user'
    ) {
      return true;
    } else {
      return false;
    }
  }
}
