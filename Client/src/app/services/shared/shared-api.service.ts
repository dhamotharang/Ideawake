import { ApiService } from '../backend.service';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

@Injectable()
export class SharedApi {
  getEntity: any;
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  searchTags(term?) {
    return this.apiService.get(`/tag/search?name=${term || ''}`);
  }

  addTags(body) {
    return this.apiService.post('/tag', body);
  }

  getAllCommunityIdeas(community, params?) {
    return this.apiService.get(`/opportunity?community=${community}`, params);
  }

  upvoteIdea(body) {
    return this.apiService.post(`/vote`, body);
  }

  deleteUpvoteIdea(upvoteId) {
    return this.apiService.delete(`/vote/${upvoteId}`);
  }

  getIdeaUpvoteStatus(idea, community) {
    return this.apiService.get(`/vote/idea/${idea}?community=${community}`);
  }

  getCommentUpvoteStatus(comment, community) {
    return this.apiService.get(
      `/vote/comment/${comment}?community=${community}`
    );
  }

  getMyEntitiesUpvotes(options: {
    entityTypeAbbr: string;
    entityObjectIds: number[];
  }) {
    return this.apiService.post(`/vote/fetch-my-entities-votes`, options);
  }

  getFollowersCounts(entityId, users) {
    return this.apiService.get(
      `/users/get-user-counts?entityType=${entityId}${users}`
    );
  }

  getUniqueUserCounts(body) {
    return this.apiService.post('/users/unique-count', body);
  }

  getCurrentUsersFollowersStatus(entityObjectIds) {
    return this.apiService.get(
      '/following-content/user/following?userId=' +
        this.ngRedux.getState().userState.user.id +
        entityObjectIds
    );
  }

  editJumbotronSettings(settings) {
    return this.apiService.patch(
      `/community-appearance-setting/${settings.id}`,
      {
        ...settings,
        ...{ community: this.ngRedux.getState().userState.currentCommunityId }
      }
    );
  }

  getJumbotronSettings() {
    return this.apiService.get(
      `/community-appearance-setting?community=${
        this.ngRedux.getState().userState.currentCommunityId
      }`
    );
  }

  importBulkData(importType: string, data) {
    return this.apiService.post(`/${importType}/import-bulk`, data);
  }

  getBookmarkPermission(body) {
    return this.apiService.post(`/bookmarked-view/get-permissions`, body);
  }

  bookmarkView(body) {
    return this.apiService.post(`/bookmarked-view`, body);
  }

  updateBookmarkView(id, body) {
    return this.apiService.patch(`/bookmarked-view/${id}`, body);
  }

  getBookmarkedView(params?) {
    return this.apiService.get(`/bookmarked-view`, params);
  }

  getSingleBookmarkedView(id) {
    return this.apiService.get(`/bookmarked-view/${id}`);
  }

  deleteBookmarkedView(id) {
    return this.apiService.delete(`/bookmarked-view/${id}`);
  }

  addAnnouncement(body) {
    return this.apiService.post('/announcement/', body);
  }

  patchAnnouncement(id, body) {
    return this.apiService.patch(`/announcement/${id}`, body);
  }

  getAnnouncements(params?) {
    return this.apiService.get('/announcement/feed', params);
  }

  getAnnouncement(id) {
    return this.apiService.get(`/announcement/${id}`);
  }

  deleteAnnouncement(id) {
    return this.apiService.delete(`/announcement/${id}`);
  }

  getFilteredAnnouncements(params?) {
    return this.apiService.get('/announcement', params);
  }

  getAnouncementTargetsCount(body) {
    return this.apiService.post(
      '/announcement/get-potential-targets-count/',
      body
    );
  }
}
