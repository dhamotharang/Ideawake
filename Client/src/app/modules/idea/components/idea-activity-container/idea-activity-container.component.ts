import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ActivityApiService, UtilService } from '../../../../services';
import { AppState } from '../../../../store';
import {
  ACTIVITY_ACTION_TYPES,
  ACTIVITY_ICONS,
  ACTIVITY_SORTING,
  CURRENT_IDEA_ACTIVITY
} from '../../../../utils';

@Component({
  selector: 'app-idea-activity-container',
  templateUrl: './idea-activity-container.component.html',
  styleUrls: ['./idea-activity-container.component.scss']
})
export class IdeaActivityContainerComponent implements OnInit {
  @Input() ideaId = 0;
  @Input() inModel = false;

  @Output() switchTab = new EventEmitter<any>();

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
    private ngRedux: NgRedux<AppState>,
    private activityApiService: ActivityApiService,
    public util: UtilService
  ) {}

  ngOnInit() {
    this.default.community = this.currentUser.currentCommunityId;
    this.default.entityObjectId = this.ideaId;
    this.getActivityTypes();
    this.searchActivities(this.default);
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
    return this.currentUser.user.id === id ? true : false;
  }
  switchTabToSummary() {
    this.switchTab.emit('summary');
  }
}
