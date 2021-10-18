import { ApiService } from '../backend.service';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  getCommunityDashBoards(params?) {
    return this.apiService.get('/dashboard', params);
  }

  addCommunityDashboard(body) {
    return this.apiService.post('/dashboard', {
      ...body,
      community: this.ngRedux.getState().userState.currentCommunityId
    });
  }

  updateCommunityDashboard(id, body) {
    return this.apiService.patch(`/dashboard/${id}`, {
      ...body,
      community: this.ngRedux.getState().userState.currentCommunityId
    });
  }

  getDashboard(id) {
    return this.apiService.get(`/dashboard/${id}`);
  }

  addGadget(body) {
    return this.apiService.post('/widget', {
      ...body,
      community: this.ngRedux.getState().userState.currentCommunityId
    });
  }

  updateGadget(id, body) {
    const b = {
      ...body,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    delete b.communityId;
    delete b.dashboardId;
    delete b.entityTypeId;
    delete b.updatedBy;
    delete b.updatedAt;
    delete b.createdBy;
    delete b.createdAt;

    return this.apiService.patch(`/widget/${id}`, b);
  }

  getDashboardGadgets(params?) {
    return this.apiService.get('/widget', params);
  }

  deleteWidget(id) {
    return this.apiService.delete(`/widget/${id}`);
  }
}
