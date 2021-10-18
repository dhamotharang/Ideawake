import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';

@Injectable()
export class ProfileApiService {
  constructor(private apiService: ApiService) {}

  getGroups() {
    return this.apiService.get('/circle');
  }

  getUser(id) {
    return this.apiService.get(`/users/${id}`);
  }

  updateUser(id, body) {
    return this.apiService.patch(`/users/${id}`, body);
  }

  getFollowingContentByUser(params?) {
    return this.apiService.get(`/following-content/user/all`, params);
  }

  getFollowingContentCounts(params) {
    return this.apiService.get(`/following-content/counts`, params);
  }

  getEntityFollowingContentByUser(entityId, params?) {
    return this.apiService.get(`/following-content/entity/${entityId}`, params);
  }

  getMultipleUsers(params?) {
    return this.apiService.get(`/users`, params);
  }

  getMultipleOpportunities(params?) {
    return this.apiService.get(`/opportunity`, params);
  }

  getBookmarksByUser(params?) {
    return this.apiService.get(`/bookmark/user/all`, params);
  }

  getEntityBookmarksByUser(entityId, params?) {
    return this.apiService.get(`/bookmark/entity/${entityId}`, params);
  }

  getBookmarksCounts(params) {
    return this.apiService.get(`/bookmark/counts`, params);
  }

  getFollowers(params) {
    return this.apiService.get('/following-content/user/followers', params);
  }

  getActivities(id) {
    return this.apiService.get(`/activity/user/${id}?dummy=0`);
  }

  getTags() {
    return this.apiService.get('/tag');
  }

  addTags(tag) {}

  followUser(body) {
    return this.apiService.post(`/following-content`, body);
  }

  getIdeasByUser(communityId, userId) {
    return this.apiService.get(
      `/opportunity?community=${communityId}&user=${userId}`
    );
  }

  getBulkProfileImages(ids) {
    return this.apiService.post('/users/get-users-profile-image', {
      userIds: ids
    });
  }

  getBulkUsersData(ids) {
    return this.apiService.post('/users/get-users-data', {
      userIds: ids
    });
  }
}
