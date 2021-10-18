import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Injectable, OnDestroy } from '@angular/core';

import { AppState, STATE_TYPES } from '../../store';
import { ApiService } from '../backend.service';
import { param } from 'jquery';

@Injectable()
export class SettingsApiService implements OnDestroy {
  currentUser;
  private sub: Subscription;
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.currentUser = state;
      });
  }

  getUsers(params?) {
    return this.apiService.get(`/users/community/search`, params);
  }

  getUsersDetail(params?) {
    return this.apiService.get(`/users/get-user-detail-counts`, params);
  }

  getInvites({
    communityId,
    sortBy = '',
    sortType = '',
    searchByName = '',
    searchByEmail = '',
    exportData = false,
    showArchived = false,
    offset = 0,
    limit = 100
  }) {
    return this.apiService.get(`/invite/community/search`, arguments[0]);
  }

  updateRole(body) {
    return this.apiService.patch(`/users/update-user-role`, body);
  }

  updateInviteRole(id, body) {
    return this.apiService.patch(`/invite/${id}`, body);
  }

  getUsersCount(params?) {
    return this.apiService.get(`/users/count-by-community`, params);
  }

  getInvitesCount(communityId) {
    return this.apiService.get(
      `/invite/count-by-community?communityId=${communityId}`
    );
  }

  deleteUser(users) {
    const payload = {
      users: users,
      isDeleted: true
    };
    return this.apiService.patch(`/users/archive`, payload);
  }

  unarchiveUser(users) {
    const payload = {
      users,
      isDeleted: false
    };
    return this.apiService.patch(`/users/archive`, payload);
  }

  bulkDeleteUser(body) {
    return this.apiService.delete(`/users/bulk`, body);
  }

  deleteInvite(id) {
    return this.apiService.patch(`/invite/${id}`, { isDeleted: true });
  }

  getCommunityPoints() {
    return this.apiService.get('/community-action-point', {
      community: this.currentUser.currentCommunityId
    });
  }

  saveCommunityPoints(entityActions) {
    return this.apiService.patch('/community-action-point', entityActions);
  }

  getActionTypes() {
    return this.apiService.get('/action-type');
  }

  getCommunityRoles(level: string, params?) {
    return this.apiService.get('/role', {
      level,
      community: this.currentUser.currentCommunityId,
      ...params
    });
  }

  sendCommunityInvites(body) {
    return this.apiService.post('/invite/send-invites', body);
  }

  reSendInvites(body) {
    return this.apiService.post('/invite/reset-invite', body);
  }

  reSendAllInvites(body) {
    return this.apiService.patch('/invite/resend-all', body);
  }

  getInvitesList(id, params?) {
    return this.apiService.get(`/invite/invites-by-community/${id}`, params);
  }

  getInvitesCounts(params?) {
    return this.apiService.get(`/invite/counts`, params);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
