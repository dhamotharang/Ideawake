import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ProfileApiService } from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import { CONTENT_CARD_TYPE, FOLLOW_FILTERS } from '../../../../utils/constants';

@Component({
  selector: 'app-profile-following',
  templateUrl: './profile-following.component.html',
  styleUrls: ['./profile-following.component.scss'],
  providers: [ProfileApiService]
})
export class ProfileFollowingComponent implements OnInit, OnDestroy {
  public user;
  public currentUser;
  public skills;
  public entity;
  public cardType = CONTENT_CARD_TYPE;
  public followingOpportunities;
  public followingUsers;
  public counts;
  public entityType;
  public filters = FOLLOW_FILTERS;
  public selectedFilter = FOLLOW_FILTERS.all.key;
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
      .getFollowingContentCounts({ userId })
      .subscribe((res: any) => {
        this.counts = _.keyBy(res.response, 'entity_type_id');
        this.counts.all = _.sumBy(res.response, (item) => Number(item.count));
      });
  }
  showCount(id, key) {
    if (key === this.filters.all.key) {
      return _.get(this.counts, 'all', 0);
    } else {
      return this.counts ? (this.counts[id] ? this.counts[id].count : 0) : 0;
    }
  }

  subscribeUser() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userSubs = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.currentUser = id === state.user.id;
        this.getUserFollowingContent(id);
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

  getUserFollowingContent(userId) {
    this.profileApiService
      .getFollowingContentByUser({ userId })
      .subscribe((res: any) => {
        const userIds = this.getFollowingUserIds(res.response);
        const opportunityIds = this.getFollowingOpportunityIds(res.response);
        if (userIds && userIds.length) {
          this.getFollowingUsers(userIds);
        }
        if (opportunityIds && opportunityIds.length) {
          this.getOpportunities(opportunityIds);
        }
      });
  }

  getFollowingUserIds(response) {
    return _.compact(
      _.map(response, (entity) => {
        if (entity.entityType.name === 'user') {
          return entity.entityObjectId;
        }
      })
    );
  }

  getFollowingOpportunityIds(response) {
    return _.compact(
      _.map(response, (entity) => {
        if (entity.entityType.name === 'idea') {
          return entity.entityObjectId;
        }
      })
    );
  }

  getEntityWise(entityId, type, userId) {
    this.profileApiService
      .getEntityFollowingContentByUser(entityId, { userId })
      .subscribe((res: any) => {
        const ids = _.map(res.response, 'entityObjectId');
        if (ids && ids.length) {
          if (type === 'user') {
            this.getFollowingUsers(ids);
          } else {
            this.getOpportunities(ids);
          }
        }
      });
  }

  getOpportunities(ids) {
    this.profileApiService
      .getMultipleOpportunities({ id: ids })
      .subscribe((res: any) => {
        this.followingOpportunities = res.response;
      });
  }
  getFollowingUsers(ids) {
    this.profileApiService
      .getMultipleUsers({ id: ids })
      .subscribe((res: any) => {
        this.followingUsers = res.response;
      });
  }

  filterData(id, key) {
    this.selectedFilter = key;
    const userId = this.route.snapshot.paramMap.get('id');
    this.followingOpportunities = null;
    this.followingUsers = null;
    if (key === 'all') {
      this.getUserFollowingContent(userId);
    } else {
      this.getEntityWise(id, key, userId);
    }
  }
  unFollowedContent() {
    if (this.currentUser) {
      this.getCounts();
      this.filterData(
        this.filters[this.selectedFilter].id,
        this.filters[this.selectedFilter].key
      );
    }
  }
}
