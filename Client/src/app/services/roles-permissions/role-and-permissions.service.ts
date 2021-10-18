import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class RoleAndPermissionsApi {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  getPermissionsByEntityTypeAndObjectId(params: {
    entityType: any;
    entityObjectId: any;
    community: any;
  }) {
    return this.apiService.get('/entityExperienceSetting', params);
  }

  getPermissionsByEntityAndObjectBulk(body) {
    return this.apiService.post('/entityExperienceSetting/get-bulk', body);
  }

  getUserPermissionsInCommunity() {
    return this.apiService.get('/community/permissions', {
      id: this.ngRedux.getState().userState.currentCommunityId
    });
  }

  getUserPermissionsInOpportunity(id: number) {
    return this.apiService.get('/opportunity/permissions', {
      id
    });
  }

  getOpportunitySettingsForUser(id: number) {
    return this.apiService.get(`/opportunity-type/experience-settings/${id}`);
  }

  getUserPermissionsInChallenge(id: number) {
    return this.apiService.get(`/challenge/permissions`, {
      id
    });
  }

  getUserPermissionsInCustomFields(
    opportunity: number,
    customFields: Array<number>
  ) {
    return this.apiService.get(`/custom-field/permissions`, {
      opportunity,
      customFields
    });
  }
}
