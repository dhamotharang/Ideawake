import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationApiService {
  constructor(private apiService: ApiService) {}

  checkDuplicateEmail(email) {
    return this.apiService.get(
      `/users/check-duplicate?email=${encodeURIComponent(email)}`
    );
  }

  resetUserPassword(email) {
    return this.apiService.post('/auth/reset-password', {
      email
    });
  }

  getCurrentUserData() {
    return this.apiService.get(`/users/get-current-user-data`);
  }

  acceptUserInvite(id) {
    return this.apiService.get(
      `/invite/validate?inviteCode=${id}&loadUser=true`
    );
  }

  addUserToCommunityViaInviteCode(body) {
    return this.apiService.post(`/auth/accept-invite`, body);
  }

  getCommunityDataBeforeLogin(body) {
    return this.apiService.get(`/community/details-from-url`, body);
  }

  switchCommunityToken(params?) {
    return this.apiService.get(`/auth/switch-user-community`, params);
  }

  samlRedirectUrl() {
    return this.apiService.get('/auth/saml-callback-url');
  }

  authIntegrations(params?) {
    return this.apiService.get('/auth-integration', params);
  }

  updateAuthIntegrations(body?) {
    return this.apiService.put('/auth-integration', body);
  }

  registerTenant(body) {
    return this.apiService.post('/auth/user-register', body);
  }
}
