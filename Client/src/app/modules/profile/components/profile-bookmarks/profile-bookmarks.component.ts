import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ProfileApiService } from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import { BOOKMARK_FILTERS, CONTENT_CARD_TYPE } from '../../../../utils';

@Component({
  selector: 'app-profile-bookmarks',
  templateUrl: './profile-bookmarks.component.html',
  styleUrls: ['./profile-bookmarks.component.scss'],
  providers: [ProfileApiService]
})
export class ProfileBookmarksComponent implements OnInit, OnDestroy {
  public user;
  public currentUser;
  public skills;
  public entity;
  public cardType = CONTENT_CARD_TYPE;
  public bookmarkedData: any;
  public counts;
  public entityType;
  public filters = BOOKMARK_FILTERS;
  public selectedFilter = BOOKMARK_FILTERS.all.key;
  public objectKeys = Object.keys;
  public entities = this.ngRedux.getState().entitiesState;
  private userSubs: Subscription;
  constructor(
    private ngRedux: NgRedux<AppState>,
    private profileApiService: ProfileApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.mapEntityIds();
    this.getCounts();
    this.subscribeUser();
  }

  ngOnDestroy() {
    if (this.userSubs) {
      this.userSubs.unsubscribe();
    }
  }

  mapEntityIds() {
    _.forEach(this.entities, (e) => {
      if (this.filters[e.abbreviation]) {
        this.filters[e.abbreviation].id = e.id;
      }
    });
  }
  getCounts() {
    const userId = this.route.snapshot.paramMap.get('id');
    this.profileApiService
      .getBookmarksCounts({ userId })
      .subscribe((res: any) => {
        this.counts = _.keyBy(res.response, 'entity_type_id');
        this.counts.all = _.sumBy(res.response, 'count');
      });
  }
  showCount(id, key) {
    if (key === this.filters.all.key) {
      return _.get(this.counts, 'all', 0);
    } else {
      return _.isEmpty(id) ? 0 : _.get(this.counts, id + '.count', 0);
    }
  }
  subscribeUser() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userSubs = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.currentUser = id === state.user.id;
        this.getUserBookMarks(id);
        if (this.currentUser) {
          this.user = state.user;
          this.skills = this.user.skills;
        } else {
          this.getUserById(id);
        }
      });
  }

  getUserById(id) {
    this.profileApiService.getUser(id).subscribe((res: any) => {
      this.user = res.response[0];
      this.skills = this.user.skills;
    });
  }

  getUserBookMarks(userId) {
    this.profileApiService
      .getBookmarksByUser({ userId })
      .subscribe((res: any) => {
        const ids = _.map(res.response, 'entityObjectId');
        if (ids && ids.length) {
          this.getOpportunities(ids);
        }
      });
  }

  getEntityBookMarks(entityId, userId) {
    this.profileApiService
      .getEntityBookmarksByUser(entityId, { userId })
      .subscribe((res: any) => {
        const ids = _.map(res.response, 'entityObjectId');
        if (ids && ids.length) {
          this.getOpportunities(ids);
        }
      });
  }

  getOpportunities(ids) {
    this.bookmarkedData = null;
    this.profileApiService
      .getMultipleOpportunities({ id: ids })
      .subscribe((res: any) => {
        this.bookmarkedData = res.response;
      });
  }

  filterData(id, key) {
    this.selectedFilter = key;
    const userId = this.route.snapshot.paramMap.get('id');
    if (key === 'all') {
      this.getUserBookMarks(userId);
    } else {
      this.getEntityBookMarks(id, userId);
    }
  }
}
