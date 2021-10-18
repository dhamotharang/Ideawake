import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class CommunityApi {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  private updateObject(settings) {
    return {
      ...settings,
      ...{ community: this.ngRedux.getState().userState.currentCommunityId }
    };
  }

  checkDuplicateCommunities(url) {
    return this.apiService.get(`/community/check-duplicate?url=${url}`);
  }

  getAppearanceSettings() {
    return this.apiService.get(
      `/community-appearance-setting?community=${
        this.ngRedux.getState().userState.currentCommunityId
      }`
    );
  }

  saveAppearanceSettings(settings) {
    return this.apiService.post(
      `/community-appearance-setting`,
      this.updateObject(settings)
    );
  }

  editAppearanceSettings(settings) {
    return this.apiService.patch(
      `/community-appearance-setting/${settings.id}`,
      this.updateObject(settings)
    );
  }

  addNewOpportunity(opportunity) {
    return this.apiService.post(
      '/opportunity-type',
      this.updateObject(opportunity)
    );
  }

  getAllOpportunities() {
    return this.apiService.get(
      `/opportunity-type?community=${
        this.ngRedux.getState().userState.currentCommunityId
      }`
    );
  }

  getOpportunityById(id) {
    return this.apiService.get(`/opportunity-type/${id}`);
  }

  getOpportunityTypePostingExperience() {
    return this.apiService.get('/opportunity-type-posting-experience');
  }

  getOpportunityVisibilityAndPermissionSettings(id) {
    return this.apiService.get(`/opportunity-type/experience-settings/${id}`);
  }

  editOpportunityType(data) {
    return this.apiService.patch(`/opportunity-type/${data.id}`, data);
  }

  editOpportunityVisibilityAndPermissionSettings(id, data) {
    return this.apiService.patch(
      `/opportunity-type/experience-settings/${id}`,
      data
    );
  }

  getCommunityLeaderboard(params?) {
    return this.apiService.get('/user-action-point', {
      community: this.ngRedux.getState().userState.currentCommunityId,
      ...params
    });
  }

  getUserCommunities() {
    return this.apiService.get(
      `/community/tenant-communities?community=${
        this.ngRedux.getState().userState.currentCommunityId
      }&isDeleted=false`
    );
  }

  createNewCommunityUnderATenant(body) {
    return this.apiService.post('/community', body);
  }

  getCommunityTopUsers() {
    const community = this.ngRedux.getState().userState.currentCommunityId;
    return this.apiService.get(
      `/analytics/community/${community}/users/top-engagement`
    );
  }

  getCommunityTopGroups() {
    const community = this.ngRedux.getState().userState.currentCommunityId;
    return this.apiService.get(
      `/analytics/community/${community}/groups/top-engagement`
    );
  }

  editCommunity(id, body) {
    return this.apiService.patch(`/community/${id}`, body);
  }

  getCommunityById(id) {
    return this.apiService.get(`/community/${id}`);
  }

  acceptUserInvite(user, inviteCode) {
    return this.apiService.post(`/auth/accept-invite`, {
      user,
      inviteCode
    });
  }

  sendCommunityInvite(data) {
    return this.apiService.post('/invite/send-invites', data);
  }

  getMentionData(params?) {
    return this.apiService.get('/mention/mentionable-data', params);
  }
}
