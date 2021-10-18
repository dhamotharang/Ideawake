import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class CommentApiService {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  getComments(entityObjectId) {
    return this.apiService.get(`/comment-thread`, {
      entityObjectId: entityObjectId,
      community: this.ngRedux.getState().userState.currentCommunityId,
      isDeleted: false
    });
  }

  postComment(body) {
    body.community = this.ngRedux.getState().userState.currentCommunityId;
    return this.apiService.post('/comment', body);
  }

  editComment(id, body) {
    return this.apiService.patch(`/comment/${id}`, body);
  }

  postReply() {}
}
