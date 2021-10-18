import { Component, Input, OnInit } from '@angular/core';

import { EntityApiService, SharedApi } from '../../../../services';
import { ENTITY_TYPE, DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

@Component({
  selector: 'app-engagement-modal',
  templateUrl: './engagement-modal.component.html',
  styleUrls: ['./engagement-modal.component.scss']
})
export class EngagementModalComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() upvoters;
  @Input() followers;
  @Input() modalRef;
  @Input() entityType;

  userEntity;
  data;
  counts;
  opened;
  entity = ENTITY_TYPE.USER;

  allUsersUpvoteCounts;
  allUsersFollowCounts;

  constructor(
    private sharedApi: SharedApi,
    private entityApiService: EntityApiService
  ) {}

  ngOnInit() {
    this.data = this.upvoters;
    this.opened = 'upvoters';
    this.userEntity = this.entityApiService.getEntity(ENTITY_TYPE.USER);
    this.getUpvotersCounts();
    this.getFollowersCounts();
  }

  private getUpvotersCounts() {
    let allUsers = '';
    let entityObjectIds = '';
    this.upvoters.forEach((upvoter) => {
      allUsers += '&userIds[]=' + upvoter.user.id;
      entityObjectIds += '&entityObjectIds[]=' + upvoter.user.id;
    });

    this.sharedApi
      .getCurrentUsersFollowersStatus(entityObjectIds)
      .subscribe((res: any) => {
        res.response.forEach((follow) => {
          const temp = this.upvoters.find(
            (u) => u.user.id === follow.entityObjectId
          );
          temp.user.followId = follow.id;
          temp.user.following = true;
        });
      });
    this.sharedApi
      .getFollowersCounts(this.entityType.id, allUsers)
      .subscribe((res: any) => {
        this.allUsersUpvoteCounts = res.response;
        this.counts = this.allUsersUpvoteCounts;
      });
  }

  private getFollowersCounts() {
    let allUsers = '';
    let entityObjectIds = '';
    this.followers.forEach((follower) => {
      allUsers += '&userIds[]=' + follower.user.id;
      entityObjectIds += '&entityObjectIds[]=' + follower.user.id;
    });

    this.sharedApi
      .getCurrentUsersFollowersStatus(entityObjectIds)
      .subscribe((res: any) => {
        res.response.forEach((follow) => {
          const temp = this.followers.find(
            (u) => u.user.id === follow.entityObjectId
          );
          temp.user.followId = follow.id;
          temp.user.following = true;
        });
      });

    this.sharedApi
      .getFollowersCounts(this.entityType.id, allUsers)
      .subscribe((res: any) => {
        this.allUsersFollowCounts = res.response;
      });
  }

  private selectData(selector) {
    switch (selector) {
      case 'upvoters':
        return { data: this.upvoters, counts: this.allUsersUpvoteCounts };
      case 'downvoters':
        return '';
      case 'followers':
        return { data: this.followers, counts: this.allUsersFollowCounts };
    }
    return this.upvoters;
  }

  changeTab(tab) {
    this.opened = tab;
    const selected = this.selectData(this.opened);
    this.data = selected.data;
    this.counts = selected.counts;
  }

  follow(user, i) {
    const selected = this.selectData(this.opened);
    selected.data[i].user = user;
  }
}
