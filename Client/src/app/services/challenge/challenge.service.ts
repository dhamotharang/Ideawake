import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';

@Injectable()
export class ChallengesApiService {
  constructor(private apiService: ApiService) {}

  searchChallenges(params?) {
    return this.apiService.get(`/challenge`, params);
  }

  getChallengeById(id) {
    return this.apiService.get(`/challenge/${id}`);
  }

  postChallenge(body) {
    return this.apiService.post(`/challenge`, body);
  }

  updateChallenge(id, body) {
    return this.apiService.patch(`/challenge/${id}`, body);
  }

  deleteChallenge(id) {
    return this.apiService.delete(`/challenge/${id}`);
  }

  addChallengeView(id) {
    return this.apiService.patch(`/challenge/increase-view-count/${id}`, {});
  }

  getTopUsers(id, params?) {
    return this.apiService.get(
      `/analytics/challenge/${id}/users/top-engagement`,
      params
    );
  }

  getTopGroups(id, params?) {
    return this.apiService.get(
      `/analytics/challenge/${id}/groups/top-engagement`,
      params
    );
  }

  updateStatusSettings(id, body) {
    return this.apiService.patch(
      `/challenge/update-challenge-status/${id}`,
      body
    );
  }

  getPostOpportunityPermissions(body) {
    return this.apiService.post(`/challenge/get-post-opp-permissions`, body);
  }

  filterChallenges(params) {
    return this.apiService.get(`/challenge/search-challenge`, params);
  }

  getOpportunityCount(body) {
    return this.apiService.post(`/challenge/opportunity-count`, body);
  }
}
