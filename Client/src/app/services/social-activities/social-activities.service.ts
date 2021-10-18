import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class SocialActivitiesApiService {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  addToBookmarks(entity) {
    return this.apiService.post('/bookmark', entity);
  }

  removeFromBookmarks(id) {
    return this.apiService.delete(
      `/bookmark/user/${
        this.ngRedux.getState().userState.user.id
      }/bookmark/${id}`
    );
  }

  addToFollowing(body) {
    return this.apiService.post('/following-content', body);
  }

  removeFromFollowing(followId) {
    return this.apiService.delete(
      `/following-content/user/${
        this.ngRedux.getState().userState.user.id
      }/follow/${followId}`
    );
  }
}
