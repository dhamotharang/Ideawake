import { Injectable } from '@angular/core';
import { ApiService } from '../backend.service';

@Injectable()
export class StatusApiService {
  constructor(private apiService: ApiService) {}

  getAll(params?) {
    return this.apiService.get(`/status`, params);
  }

  getById(id) {
    return this.apiService.get(`/status/${id}`);
  }

  getNextStatus(id) {
    return this.apiService.get(`/workflow/next-status/${id}`);
  }
}
