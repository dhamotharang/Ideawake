import * as _ from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { EntityApiService, SharedApi } from '../../../../services';

import { AppState } from '../../../../store';
import { ConsoleService } from '@ng-select/ng-select/lib/console.service';
import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-upvote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit, OnChanges {
  @Input() entity;
  @Input() upvotes;
  @Input() upvoteData;
  @Input() inlineIcon = false;
  @Input() smallIcon = false;
  @Output() upvoteActionEmitter = new EventEmitter<any>();

  upvoteAction = false;
  upvote;
  mouseLeaveFlag = false;
  entityType;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  ngOnChanges() {
    if (this.upvoteData) {
      this.upvote = _.find(this.upvoteData, [
        'user.id',
        this.ngRedux.getState().userState.user.id
      ]);
    }
  }

  mouseEnter(div) {}

  mouseLeave() {
    if (this.upvote) {
      this.mouseLeaveFlag = true;
    }
  }

  toggle(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (this.upvote) {
      this.updateUpvoteAction(this.removeUpvote);
    } else {
      this.updateUpvoteAction(this.addUpvote);
    }
  }

  private async removeUpvote() {
    await this.sharedApi.deleteUpvoteIdea(this.upvote.id).toPromise();
    this.upvoteActionEmitter.emit({
      type: 'remove',
      user: this.ngRedux.getState().userState.user
    });
    const eId = this.entity.id;
    this.upvotes[eId] = this.upvotes[eId] - 1;
  }

  private async addUpvote() {
    const upvoteObject = {
      voteType: 'upvote',
      entityObjectId: this.entity.id,
      entityType: this.entityType.id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    const res: any = await this.sharedApi.upvoteIdea(upvoteObject).toPromise();
    this.upvoteActionEmitter.emit({
      type: 'add',
      data: { ...res.response, user: this.ngRedux.getState().userState.user }
    });
    const eId = this.entity.id;
    this.upvotes[eId] = (this.upvotes[eId] || 0) + 1;
    this.mouseLeaveFlag = false;
  }

  private async updateUpvoteAction(callback) {
    this.upvoteAction = true;
    if (callback) {
      await callback.bind(this)();
    }
    this.upvoteAction = false;
  }
}
