import * as _ from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import {
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_TYPE,
  LEADERBOARD_STATS_FREQUENCY
} from '../../../../utils';
import { EntityApiService, ProfileApiService } from '../../../../services';

import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-leaderboard-list',
  templateUrl: './leaderboard-list.component.html',
  styleUrls: ['./leaderboard-list.component.scss'],
  providers: [ProfileApiService]
})
export class LeaderboardListComponent implements OnInit, OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() rankList;
  @Output() frequency = new EventEmitter<string>();

  selected: string;
  allUsersFollowCounts;
  entity;

  currentUser;

  statsFrequency = LEADERBOARD_STATS_FREQUENCY;

  constructor(
    private profileApi: ProfileApiService,
    private entityApiService: EntityApiService,
    ngRedux: NgRedux<AppState>
  ) {
    this.selected = this.statsFrequency.MONThLY;
    this.currentUser = ngRedux.getState().userState;
  }

  ngOnInit() {
    this.entity = this.getEntity();
    this.getFollowersCounts();
  }

  ngOnChanges() {
    if (this.rankList) {
      this.getFollowersCounts();
    }
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

  updateFrequency(f: string) {
    this.selected = f;
    this.frequency.emit(f);
  }

  private getFollowersCounts() {
    this.profileApi
      .getFollowers({
        userId: this.currentUser.user.id,
        communityId: this.currentUser.currentCommunityId
      })
      .subscribe((res: any) => {
        _.forEach(this.rankList, (user) => {
          const temp = _.find(res.response, ['id', this.currentUser.user.id]);
          if (temp) {
            user.followId = temp.followId;
            user.following = true;
          } else {
            user.following = false;
          }
        });
      });
  }

  private getEntity() {
    return this.entityApiService.getEntity(ENTITY_TYPE.USER);
  }

  follow(user, i) {
    this.rankList[i] = user;
  }
}
