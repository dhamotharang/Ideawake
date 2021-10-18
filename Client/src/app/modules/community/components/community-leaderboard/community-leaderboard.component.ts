import { Component, OnInit } from '@angular/core';

import { CommunityApi } from '../../../../services';

@Component({
  selector: 'app-community-leaderboard',
  templateUrl: './community-leaderboard.component.html',
  styleUrls: ['./community-leaderboard.component.scss']
})
export class CommunityLeaderboardComponent implements OnInit {
  constructor(private communityApi: CommunityApi) {}
  rankList;

  ngOnInit() {
    this.getCommunityLeaderboard({ frequency: 'month' });
  }

  getCommunityLeaderboard(frequency) {
    this.communityApi
      .getCommunityLeaderboard(frequency)
      .subscribe((res: any) => {
        this.rankList = res.response;
      });
  }

  changeFrequency(frequency) {
    this.getCommunityLeaderboard({
      frequency
    });
  }
}
