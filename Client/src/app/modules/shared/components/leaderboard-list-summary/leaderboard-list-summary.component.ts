import { find, first } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { EntityApiService, ProfileApiService } from '../../../../services';
import { AppState } from '../../../../store';
import { ENTITY_TYPE, DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

@Component({
  selector: 'app-leaderboard-list-summary',
  templateUrl: './leaderboard-list-summary.component.html',
  styleUrls: ['./leaderboard-list-summary.component.scss'],
  providers: [ProfileApiService]
})
export class LeaderboardListSummaryComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() rankList = [];
  @Output() frequency = new EventEmitter<string>();

  allUsersFollowCounts;
  entity;

  currentUser;

  constructor(
    private profileApi: ProfileApiService,
    private entityApi: EntityApiService,
    ngRedux: NgRedux<AppState>
  ) {
    this.currentUser = ngRedux.getState().userState;
  }

  ngOnInit() {
    this.entity = this.getEntity();
    this.getFollowersCounts();
  }

  abbreviations(num) {
    switch (num) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      default:
        return num + 'th';
    }
  }

  private getFollowersCounts() {
    this.profileApi
      .getFollowers({
        userId: this.currentUser.user.id,
        communityId: this.currentUser.currentCommunityId
      })
      .subscribe((res: any) => {
        if (this.rankList && this.rankList.length) {
          this.rankList.forEach((user) => {
            const temp = find(
              res.response,
              (u) => u.id === this.currentUser.user.id
            );
            if (temp) {
              user.followId = temp.followId;
              user.following = true;
            } else {
              user.following = false;
            }
          });
        }
      });
  }

  private getEntity() {
    return this.entityApi.getEntity(ENTITY_TYPE.USER);
  }
}
