import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';

@Injectable()
export class WorkflowApiService {
  constructor(private apiService: ApiService) {}

  getAll(params?) {
    return this.apiService.get(`/workflow`, params);
  }

  getAllCommunityWorkflows(params?) {
    return this.apiService.get(`/workflow/workflows-with-counts`, params);
  }

  getById(id) {
    return this.apiService.get(`/workflow/${id}`);
  }

  getStageById(id) {
    return this.apiService.get(`/workflow/stage/${id}`);
  }

  createNew(body) {
    return this.apiService.post(`/workflow`, body);
  }

  updateById(id, body) {
    return this.apiService.patch(`/workflow/${id}`, body);
  }

  updateStageById(id, body) {
    return this.apiService.patch(`/workflow/stage/${id}`, body);
  }

  updateStagesOrder(body) {
    return this.apiService.patch(`/workflow/stage/update-order`, body);
  }

  deleteById(id) {
    return this.apiService.delete(`/workflow/${id}`);
  }

  getStagesDetails(params?) {
    return this.apiService.get(`/workflow/stage/list-settings-details`, params);
  }

  getAllStages(params?) {
    return this.apiService.get(`/workflow/stage`, params);
  }

  createStage(body) {
    return this.apiService.post(`/workflow/stage`, body);
  }

  deleteStageById(id) {
    return this.apiService.delete(`/workflow/stage/${id}`);
  }

  getWorkflowStageSettings(params) {
    return this.apiService.get(`/workflow/stage/stage-settings`, params);
  }

  getPotentialAssigneesCount(params?) {
    return this.apiService.get(
      `/workflow/stage/potential-assignees-count`,
      params
    );
  }

  getActionItem(params?) {
    return this.apiService.get(`/action-item`, params);
  }

  getStageEvaluationCriteria(params?) {
    return this.apiService.get(`/evaluation-criteria/integration`, params);
  }

  getStageNotifiableUserCounts(params) {
    return this.apiService.get(
      '/workflow/stage/notifiable-users-count',
      params
    );
  }
}
