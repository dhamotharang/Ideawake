import { get, isEmpty } from 'lodash';

import { ApiService, EntityApiService, SharedApi } from '../../../../services';
import { Component, Input, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../../../store';
import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-upvote-text',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteTextComponent implements OnInit {
  @Input() entity;
  @Input() upvotes;
  @Input() fetchMyVote = false;
  @Input() isUpvote = false;
  @Input() upvoteData?: {};

  upvoteAction = false;
  mouseLeaveFlag = false;
  entityType;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.COMMENT);

    if (this.fetchMyVote || (this.isUpvote && isEmpty(this.upvoteData))) {
      this.sharedApi
        .getCommentUpvoteStatus(
          this.entity.id,
          this.ngRedux.getState().userState.currentCommunityId
        )
        .subscribe((res: any) => {
          if (res.response) {
            this.upvoteData = res.response;
            this.isUpvote = true;
            this.mouseLeaveFlag = true;
          } else {
            this.isUpvote = false;
          }
        });
    } else if (this.isUpvote) {
      this.mouseLeaveFlag = true;
    }
  }

  mouseEnter(div: string) {}

  mouseLeave(event) {
    if (this.isUpvote) {
      this.mouseLeaveFlag = true;
    }
  }

  upvoteIdea(isUpvote) {
    this.upvoteAction = true;
    if (isUpvote) {
      // remove upvote
      this.isUpvote = false;
      this.sharedApi
        .deleteUpvoteIdea(this.upvoteData['id'])
        .subscribe((res: any) => {
          this.upvotes[this.entity.id] =
            parseInt(this.upvotes[this.entity.id], 10) - 1;
          setTimeout(() => {
            this.upvoteAction = false;
          }, 200);
        });
    } else {
      // add upvote
      const upvoteObject = {
        voteType: 'upvote',
        entityObjectId: this.entity.id,
        entityType: this.entityType.id,
        community: this.ngRedux.getState().userState.currentCommunityId
      };
      this.sharedApi.upvoteIdea(upvoteObject).subscribe((res: any) => {
        if (get(res, 'statusCode', 200) === 200) {
          this.isUpvote = true;
          this.upvotes[this.entity.id] =
            parseInt(get(this.upvotes, this.entity.id, 0), 10) + 1;
          this.upvoteData = res.response;
          this.mouseLeaveFlag = false;
          setTimeout(() => {
            this.upvoteAction = false;
          }, 200);
        }
      });
    }
  }
}
