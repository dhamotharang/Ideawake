import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ActivityApiService, UtilService } from '../../../../services';
import { AppState } from '../../../../store';
import {
  ACTIVITY_ACTION_TYPES,
  ACTIVITY_ICONS,
  ACTIVITY_PHRASE,
  ACTIVITY_SORTING
} from '../../../../utils';

@Component({
  selector: 'app-profile-activity',
  templateUrl: './profile-activity.component.html',
  styleUrls: ['./profile-activity.component.scss']
})
export class ProfileActivityComponent implements OnInit {
  public objectKeys = Object.keys;
  public actionTypes = ACTIVITY_ACTION_TYPES;
  public resultCount = 0;
  public counts = {};
  public isSearching = false;
  public activityTypes = [];
  public activities = [];
  public selectedSort = 'DESC';
  public default = {
    community: '',
    userId: '',
    orderBy: 'createdAt',
    orderType: this.selectedSort,
    take: 10,
    skip: 0
  };
  public sorting = ACTIVITY_SORTING;
  public icons = ACTIVITY_ICONS;
  public pastWord = ACTIVITY_PHRASE;
  public resetFilter = { id: null, name: 'All', abbreviation: 'all' };
  public selectedFilter = this.resetFilter;
  public myProfile = false;
  constructor(
    private route: ActivatedRoute,
    private ngRedux: NgRedux<AppState>,
    private activityApiService: ActivityApiService,
    public util: UtilService
  ) {}

  ngOnInit() {
    const currentUser = this.ngRedux.getState().userState;
    this.default.community = currentUser.currentCommunityId;
    this.getActivityTypes();
    this.route.params.subscribe((params: any) => {
      this.default.userId = params.id;
      this.myProfile = currentUser.user.id == params.id ? true : false;
      this.activities = [];
      this.searchActivities(this.default);
    });
  }
  getActivityTypes() {
    this.activityApiService.getActivityTypes().subscribe((res: any) => {
      this.activityTypes = res.response;
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
      delete this.default['filterBy'];
    } else {
      this.default['filterBy'] = this.selectedFilter.abbreviation;
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
    const currentUser = this.ngRedux.getState().userState;
    return currentUser.user.id === id ? true : false;
  }
  getUserName(activity) {
    if (
      this.isThisMe(activity.userId) &&
      activity.userId === activity.actorUserId
    ) {
      return 'yourself';
    } else if (
      this.isThisMe(activity.userId) &&
      activity.userId != activity.actorUserId
    ) {
      return 'you';
    } else if (
      !this.isThisMe(activity.userId) &&
      activity.userId === activity.actorUserId
    ) {
      return 'himself';
    } else {
      return activity.userName;
    }
  }

  getLinkToRedirect(activity) {
    if (activity.entityName == 'challenge') {
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

  getDefaultText(activity) {
    const action = _.get(activity, 'actionType.abbreviation', false);
    return _.get(this.pastWord, action, '');
  }

  generateText(activity) {
    return `${this.getDefaultText(activity)} ${activity.entityName}`;
  }

  getValue(object, str) {
    return _.get(object, str, false);
  }
}
