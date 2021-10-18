import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class HeaderApiService {
  constructor(
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService
  ) {}

  getNotifications(params?) {
    if (this.ngRedux.getState().userState.currentCommunityId) {
      return this.apiService.get(
        `/activities/search/notifications?community=${
          this.ngRedux.getState().userState.currentCommunityId
        }`,
        params
      );
    }
  }

  getActionItems(params?) {
    return this.apiService.get(`/action-item/notifications`, params);
  }

  markActionItemAsRead(idArray) {
    return this.apiService.patch(
      '/action-item/notifications/mark-read',
      idArray
    );
  }

  markNotificationAsRead(idArray) {
    return this.apiService.patch('/activities/notifications/read', idArray);
  }
}
