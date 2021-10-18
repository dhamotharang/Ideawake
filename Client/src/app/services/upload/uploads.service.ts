import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ENTITY_FOLDER } from '../../utils';
import { ApiService } from '../backend.service';

@Injectable()
export class UploadApiService {
  constructor(private apiService: ApiService) {}

  getUserAttachments(user: { userId: number; communityId: number }) {
    return this.apiService.get(`/user-attachment`, {
      user: user.userId,
      community: user.communityId
    });
  }

  getSignedUrlForCustomFieldAttachment(file) {
    return this.apiService.get(
      `/${ENTITY_FOLDER.CUSTOM_FIELDS}/get-upload-url`,
      {
        fileName: file.name,
        contentType: file.type
      }
    );
  }

  getSignedUrlForPrizeAttachment(file) {
    return this.apiService.get(`/${ENTITY_FOLDER.PRIZE}/get-upload-url`, {
      fileName: file.name,
      contentType: file.type
    });
  }

  getSignedUrlForOpportunityAttachment(file) {
    return this.apiService.get(`/${ENTITY_FOLDER.OPPORTUNITY}/get-upload-url`, {
      fileName: file.name,
      contentType: file.type
    });
  }

  getSignedUrlForChallengeAttachment(file) {
    return this.apiService.get(`/${ENTITY_FOLDER.CHALLENGE}/get-upload-url`, {
      fileName: file.name,
      contentType: file.type
    });
  }

  getSignedUrlForCommunityAttachment(file) {
    return this.apiService.get(`/${ENTITY_FOLDER.COMMUNITY}/get-upload-url`, {
      fileName: file.name,
      contentType: file.type
    });
  }

  getSignedUrl(type, file) {
    switch (type) {
      case ENTITY_FOLDER.CHALLENGE:
        return this.getSignedUrlForChallengeAttachment(file);
      case ENTITY_FOLDER.COMMUNITY:
        return this.getSignedUrlForCommunityAttachment(file);
      case ENTITY_FOLDER.OPPORTUNITY:
        return this.getSignedUrlForOpportunityAttachment(file);
      case ENTITY_FOLDER.PRIZE:
        return this.getSignedUrlForPrizeAttachment(file);
      case ENTITY_FOLDER.CUSTOM_FIELDS:
        return this.getSignedUrlForCustomFieldAttachment(file);
    }
  }

  uploadOnSignedUrl(url, file) {
    return this.apiService.s3Upload(
      url,
      file,
      new HttpHeaders().set('Content-Type', file.type)
    );
  }

  updateUserBucket(body) {
    return this.apiService.post('/user-attachment', body);
  }
}
