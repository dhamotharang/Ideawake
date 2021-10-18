import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';

@Injectable()
export class ReviewCriteriaApiService {
  constructor(private apiService: ApiService) {}

  getAllTypes(params?) {
    return this.apiService.get(`/evaluation-type`, params);
  }

  getById(id) {
    return this.apiService.get(`/evaluation-criteria/${id}`);
  }

  getAll(params?) {
    return this.apiService.get(`/evaluation-criteria/`, params);
  }

  createNew(body) {
    return this.apiService.post(`/evaluation-criteria`, body);
  }

  updateById(id, body) {
    return this.apiService.patch(`/evaluation-criteria/${id}`, body);
  }

  deleteById(id) {
    return this.apiService.delete(`/evaluation-criteria/${id}`);
  }

  getEvaluationCriteriaData(params) {
    return this.apiService.get(
      `/evaluation-criteria/integration/with-response`,
      params
    );
  }

  updateEvaluationCriteriaResponses(
    params: {
      entityObjectId: number;
      entityType: number;
      community: number;
      opportunity: number;
    },
    body
  ) {
    return this.apiService.put(`/evaluation-criteria/response`, body, params);
  }

  getEvaluationCriteriaScore(params) {
    return this.apiService.get('/evaluation-criteria/entity-scores', params);
  }

  getEvaluationCriteriaScores(body) {
    return this.apiService.post('/evaluation-criteria/entity-scores', body);
  }

  getOpportunityEvaluationScore(params) {
    return this.apiService.get(
      '/evaluation-criteria/opportunity-score',
      params
    );
  }
}
