import { ApiService } from '../backend.service';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

@Injectable()
export class GroupsApiService {
  currentUser;
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {
    this.currentUser = ngRedux.getState().userState;
  }

  getGroups() {
    return this.apiService.get(
      `/circle/search?communityId=${this.currentUser.currentCommunityId}`
    );
  }
  getGroupsByPagination({
    isUserDeleted = false,
    take = 100,
    skip = 0,
    searchText = '',
    extraCircleIds = [],
    excludedIds = []
  }) {
    return this.apiService.post('/circle/search-community-circles', {
      isUserDeleted,
      take,
      skip,
      searchText,
      extraCircleIds,
      excludedIds
    });
  }
  getUsersByPagination({
    isUserDeleted = false,
    take = 100,
    skip = 0,
    searchText = '',
    extraUserIds = [],
    excludedIds = []
  }) {
    return this.apiService.post('/users/search-community-users', {
      isUserDeleted,
      take,
      skip,
      searchText,
      extraUserIds,
      excludedIds
    });
  }

  getGroup(id) {
    return this.apiService.get(`/circle/${id}`);
  }

  addGroup(data) {
    return this.apiService.post('/circle', data);
  }

  editGroup(body) {
    return this.apiService.patch(`/circle/${body.id}`, body);
  }

  deleteGroup(groupId: string) {
    return this.apiService.delete(`/circle/${groupId}`);
  }
  getGroupsCount() {
    return this.apiService.get(`/circle/count`);
  }

  getGroupsByCommunityId(
    communityId: string,
    limit: number = 9999,
    offset: number = 0,
    sortBy: string = 'name',
    sortType: string = 'asc',
    searchByName: string = '',
    showArchived: boolean = false
  ) {
    return this.apiService.get(
      // tslint:disable-next-line: max-line-length
      `/circle/search?limit=${limit}&offset=${offset}&sortBy=${sortBy}&sortType=${sortType}&searchByName=${searchByName}&showArchived=${showArchived}&communityId=${communityId}`
    );
  }

  getUsersByCommunityId(
    communityId: string,
    groupId: string = '',
    name: string = '',
    isDeleted: boolean = false
  ) {
    const params = {
      excludedCircleId: groupId,
      name,
      isDeleted
    };
    return this.apiService.get(`/community/users/${communityId}`, params);
  }

  addUsersToGroup(users) {
    return this.apiService.post('/circle/users', { users });
  }

  removeGroupsFromUser(body) {
    return this.apiService.delete('/circle/user-circles', body);
  }

  getUsersByGroupId({
    groupId,
    communityId,
    sortBy = '',
    sortType = '',
    searchByName = '',
    searchByEmail = '',
    exportData = false,
    showArchived = false,
    offset = 0,
    limit = 100000,
    isUserPending = false
  }) {
    return this.apiService.get(`/users/search`, {
      circleId: groupId,
      communityId,
      sortBy,
      sortType,
      searchByName,
      limit,
      offset,
      showArchived,
      exportData,
      searchByEmail,
      isUserPending
    });
  }

  getInvitesByGroupId({
    groupId,
    communityId,
    sortBy = '',
    sortType = '',
    searchByEmail = '',
    exportData = false,
    offset = 0,
    limit = 100000
  }) {
    return this.apiService.get(
      // tslint:disable-next-line: max-line-length
      `/invite/circle?circleId=${groupId}&communityId=${communityId}&sortBy=${sortBy}&sortType=${sortType}&searchByEmail=${searchByEmail}&limit=${limit}&offset=${offset}&exportData=${exportData}`
    );
  }

  getInvitesCount(id) {
    return this.apiService.get(`/invite/count-by-circle?circleId=${id}`);
  }
  getUsersCount(params) {
    return this.apiService.get(
      `/users/count-by-circle?circleId=${params.groupId}&communityId=${params.communityId}`
    );
  }

  getUniqueUsersCount(data) {
    return this.apiService.post('/users/unique-count', data);
  }
}
