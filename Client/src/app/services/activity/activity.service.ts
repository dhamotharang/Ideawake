import { Injectable } from '@angular/core';
import { ApiService } from '../backend.service';

@Injectable()
export class ActivityApiService {
  constructor(private apiService: ApiService) {}

  getActivityTypes(params?) {
    return this.apiService.get('/action-type', params);
  }

  searchActivity(params?) {
    return this.apiService.get(`/activities/search`, params);
  }

  userActivity(params?) {
    return this.apiService.get(`/activities/user`, params);
  }
}
