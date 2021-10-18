import { Injectable } from '@angular/core';
import { ApiService } from '../backend.service';

@Injectable()
export class SharingApiService {
  constructor(private apiService: ApiService) {}

  getIdeaSharing(id, params?) {
    return this.apiService.get(`/share/get-shared-with-ids/idea/${id}`, params);
  }

  bulkDeleteSharing(body) {
    return this.apiService.delete(`/share`, body);
  }

  shareWithUser(body?) {
    return this.apiService.post(`/share`, body);
  }
}
