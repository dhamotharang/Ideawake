import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';
import { param } from 'jquery';

@Injectable()
export class CustomFieldApiService {
  constructor(private apiService: ApiService) {}

  getAttachedFields(params?) {
    return this.apiService.get(`/custom-field/integration`, params);
  }

  getAttachedFieldsWithData(params?) {
    return this.apiService.get(`/custom-field/integration-with-data`, params);
  }

  getOpportunityCustomField(params?) {
    return this.apiService.get(`/custom-field/opportunity-linked`, params);
  }

  updateCustomFieldsData(params, body) {
    return this.apiService.put(`/custom-field/data`, body, params);
  }

  listCount(params?) {
    return this.apiService.get(`/custom-field/list-counts`, params);
  }

  roleOptions(params?) {
    return this.apiService.get(`/custom-field/role-options`, params);
  }

  checkUnique(params?) {
    return this.apiService.get(`/custom-field/check-unique-id`, params);
  }

  getTypes(params?) {
    return this.apiService.get(`/custom-field/types`, params);
  }

  getAllCustomFields(params?) {
    return this.apiService.get(`/custom-field`, params);
  }

  getById(id) {
    return this.apiService.get(`/custom-field/${id}`);
  }

  getDataCount(params?) {
    return this.apiService.get(`/custom-field/data-counts`, params);
  }

  createNew(body) {
    return this.apiService.post(`/custom-field`, body);
  }

  updateById(id, body) {
    return this.apiService.patch(`/custom-field/${id}`, body);
  }

  deleteById(id) {
    return this.apiService.delete(`/custom-field/${id}`);
  }

  bulkAttachCustomFieldData(body) {
    return this.apiService.put(
      `/custom-field/bulk-attach-custom-field-data`,
      body
    );
  }

  attachedCustomFieldDataCount(body) {
    return this.apiService.post(
      `/custom-field/attach-custom-field-count`,
      body
    );
  }
}
