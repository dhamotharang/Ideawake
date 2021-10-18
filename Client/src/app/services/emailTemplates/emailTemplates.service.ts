import { Injectable } from '@angular/core';

import { ApiService } from '../backend.service';

@Injectable()
export class EmailTemplateApiService {
  constructor(private apiService: ApiService) {}

  getEmailTemplatesCommunityWise(params?) {
    return this.apiService.get('/email-templates', params);
  }

  updateEmailTemplate(id, communityId, params?) {
    return this.apiService.patch(
      `/email-templates/${id}/${communityId}`,
      params
    );
  }

  testEmail(body?) {
    return this.apiService.post('/email-templates/test-email', body);
  }
}
