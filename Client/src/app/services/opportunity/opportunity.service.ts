import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class OpportunityApiService {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  saveOpportunity(body) {
    return this.apiService.post('/opportunity', body);
  }

  editOpportunity(opportunityId, body) {
    return this.apiService.post(`/opportunity/${opportunityId}`, body);
  }

  getOpportunity(body?) {
    return this.apiService.post('/opportunity/get-opportunity-data', body);
  }
  exportOpportunities(body?) {
    return this.apiService.post('/opportunity/export', body);
  }
  getOpportunityCount(params) {
    return this.apiService.get('/opportunity/count', params);
  }
  getOpportunityDetails(
    opportunityIds,
    params?,
    customFieldIds?,
    criteriaIds?
  ) {
    return this.apiService.post(
      '/opportunity/get-opportunity-details',
      {
        opportunityIds,
        community: this.ngRedux.getState().userState.currentCommunityId,
        customFieldIds,
        criteriaIds
      },
      { params }
    );
  }

  getOpportunitiesVisibilitySettings(opportunities) {
    return this.apiService.post('/opportunity/bulk-visibility-settings', {
      opportunities
    });
  }

  getOpportunitiesPermissionSettings(opportunities) {
    return this.apiService.post('/opportunity/bulk-permissions', {
      opportunities
    });
  }

  getOpportunitiesScore(body) {
    return this.apiService.post('/evaluation-criteria/opportunity-score', body);
  }

  getOpportunitiesStageAssignees(body) {
    return this.apiService.post('/opportunity/current-stage-assignees', body);
  }
  getOpportunitiesStageAssigneesForList(body) {
    return this.apiService.post(
      '/opportunity/curr-stage-assignees-for-list',
      body
    );
  }

  getOpportunitiesCompletionData(body) {
    return this.apiService.post('/opportunity/stage-completion-stats', body);
  }

  getOpportunityOld(params) {
    return this.apiService.get('/opportunity', params);
  }

  updateOpportunity(id, body?) {
    return this.apiService.patch(`/opportunity/${id}`, body);
  }

  getOpportunityType(params?) {
    return this.apiService.get('/opportunity-type', params);
  }

  getOpportunityFilterIds(params?) {
    return this.apiService.get('/opportunity/filter-counts', params);
  }

  getOpportunityFilterOptions(params?) {
    return this.apiService.get('/filter-option', params);
  }

  updateOpportunityFilterOptions(body?) {
    return this.apiService.put('/filter-option', body);
  }

  getOpportunityUsers(params?) {
    return this.apiService.get('/opportunity-user', params);
  }

  postOpportunityUsers(body?) {
    return this.apiService.post('/opportunity-user', body);
  }

  deleteOpportunityUsers(id) {
    return this.apiService.delete(`/opportunity-user/${id}`);
  }

  postBulkOpportunityUsers(body?) {
    return this.apiService.post('/opportunity-user/bulk-user-settings/', body);
  }

  archiveOpportunity(id) {
    return this.apiService.delete('/opportunity', [id]);
  }

  archiveOpportunities(ids: number[]) {
    return this.apiService.delete('/opportunity', ids);
  }

  bulkUpdateOpportunities(body) {
    return this.apiService.patch('/opportunity/bulk-stage-update', body);
  }

  updateViewCount(id) {
    return this.apiService.patch(`/opportunity/increase-view-count/${id}`, {});
  }

  getAllCommunityOpportunities(params?) {
    return this.apiService.get(`/opportunity`, {
      ...params,
      community: this.ngRedux.getState().userState.currentCommunityId
    });
  }

  getStageCompletionStats(id) {
    return this.apiService.get(`/opportunity/${id}/stage-completion-stats`);
  }

  getCurrentStageAssignees(id) {
    return this.apiService.get(`/opportunity/current-stage-assignees/${id}`);
  }

  getOppAssigneeCount(body?) {
    return this.apiService.post('/opportunity/assignees-count', body);
  }

  getOppStageNotifiableUsersCount(body?) {
    return this.apiService.post(
      '/opportunity/stage-notifiable-users-count',
      body
    );
  }

  getOpportunitiesExperienceAndVisibility(body: {
    opportunityTypes: [];
    community: number;
  }) {
    return this.apiService.post(
      '/opportunity-type/bulk-experience-settings/',
      body
    );
  }

  getActionItemStatusCounts(params?) {
    return this.apiService.get(`/action-item/logs/status-counts`, params);
  }

  searchDuplicates(params?) {
    return this.apiService.post(`/opportunity/search-duplicates`, params);
  }

  getDraftOpportunityList(params?) {
    return this.apiService.get('/opportunity/draft', params);
  }

  getDraftOpportunityTotalCount(params?) {
    return this.apiService.get('/opportunity/draft/count', params);
  }

  saveOpportunityDraft(body) {
    return this.apiService.post('/opportunity/draft', body);
  }

  editOpportunityDraft(draftId, body) {
    return this.apiService.patch(`/opportunity/draft/${draftId}`, body);
  }

  archiveOpportunityDraft(draftId) {
    return this.apiService.delete(`/opportunity/draft/${draftId}`);
  }

  getOpportunityScoreResponse(params) {
    return this.apiService.get(
      '/evaluation-criteria/opportunity-score-response',
      params
    );
  }

  getOpportunityCriteriaSummary(params) {
    return this.apiService.get(
      '/evaluation-criteria/opportunity-criteria-summary',
      params
    );
  }

  getOpportunityEvaluationSummary(params) {
    return this.apiService.get(
      '/evaluation-criteria/opportunity-evaluation-summary',
      params
    );
  }

  exportEvaluation(body?) {
    return this.apiService.post(
      '/evaluation-criteria/opportunity-evaluation-export',
      body
    );
  }

  getOpportunitiesEvaluationSummary(body) {
    return this.apiService.post(
      '/evaluation-criteria/opportunities-evaluation-summary',
      body
    );
  }

  getOpportunitiesCurrentPreviousStage(body) {
    return this.apiService.post('/opportunity/current-previous-stage', body);
  }

  bulkUpdateOpportunitySettings(body) {
    return this.apiService.put(`/opportunity/bulk-opportunity-settings/`, body);
  }

  getOpportunitySettingsCount(body) {
    return this.apiService.post(
      `/opportunity/bulk-opportunity-settings-count/`,
      body
    );
  }

  getOpportunityColumnOptions(params?) {
    return this.apiService.get('/column-option', params);
  }

  updateOpportunityColumnOptions(body?) {
    return this.apiService.put('/column-option', body);
  }

  linkOpportunities(body) {
    return this.apiService.post('/opportunity/link', body);
  }

  getLinkedOpportunities(id) {
    return this.apiService.get(`/opportunity/link/linkedlist/${id}`);
  }

  unLinkOpportunity(id) {
    return this.apiService.delete(`/opportunity/link/${id}`);
  }

  updateLinkageRelationship(id, body) {
    return this.apiService.patch(`/opportunity/link/${id}`, body);
  }
}
