import * as _ from 'lodash';

import { ApiService } from '../backend.service';
import { AppState } from '../../store';
import { ENTITY_TYPE } from '../../utils';
import { EntityApiService } from '../entity/entity.service';
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

@Injectable()
export class AnalyticsApiService {
  constructor(
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService,
    private entityApi: EntityApiService
  ) {}

  getChallengeActiveSummary(challengeId) {
    return this.apiService.get(
      `/analytics/challenge/${challengeId}/activity-summary`,
      {
        community: this.ngRedux.getState().userState.currentCommunityId
      }
    );
  }

  getCommunityOverallAnalytics() {
    return this.apiService.get(
      `/analytics/community/${
        this.ngRedux.getState().userState.currentCommunityId
      }/counts`
    );
  }

  getCommunityActiveSummary() {
    return this.apiService.get(
      `/analytics/community/${
        this.ngRedux.getState().userState.currentCommunityId
      }/activity-summary`
    );
  }

  getChallengeActorEngagement(challengeId) {
    return this.apiService.get(
      `/analytics/challenge/${challengeId}/actor-engagement`,
      {
        community: this.ngRedux.getState().userState.currentCommunityId
      }
    );
  }

  getCommunityActorEngagement() {
    return this.apiService.get(
      `/analytics/community/${
        this.ngRedux.getState().userState.currentCommunityId
      }/actor-engagement`
    );
  }

  getCommunityAnalyticsOnGeolocation() {
    return this.apiService.get(
      `/analytics/community/${
        this.ngRedux.getState().userState.currentCommunityId
      }/top-engagement-location`
    );
  }

  getChallengeAnalyticsOnGeolocation(challengeId) {
    return this.apiService.get(
      `/analytics/challenge/${challengeId}/top-engagement-location`
    );
  }

  getOpportunityAnalyticsOnStatus(params?) {
    return this.apiService.get(`/opportunity/opportunity-status`, {
      ...params,
      community: this.ngRedux.getState().userState.currentCommunityId,
      isDeleted: false
    });
  }

  getPieChartData(entityId, body) {
    const entity = _.find(this.entityApi.getAllEntities(), ['id', entityId]);

    let url = '';

    switch (entity.abbreviation) {
      case ENTITY_TYPE.IDEA:
        url = 'opportunities';
        break;
      case ENTITY_TYPE.CIRCLE:
        url = 'circle';
        break;
      case ENTITY_TYPE.USER:
        url = 'user';
        break;
    }
    return this.apiService.post(`/analytics/dashboard/${url}/pie`, body);
  }

  getTimeSeriesData(body) {
    return this.apiService.post(
      `/analytics/dashboard/opportunities/time-series`,
      body
    );
  }

  getBubbleChartData(body) {
    return this.apiService.post(
      `/analytics/dashboard/opportunities/bubble`,
      body
    );
  }
}
