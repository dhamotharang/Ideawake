import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnInit } from '@angular/core';
import { AppState } from '../../../../store';
import { CommunityApi, ChallengesApiService } from '../../../../services';
import { TOP_USER_TYPE } from '../../../../utils';
@Component({
  selector: 'app-top-engaged-group',
  templateUrl: './top-engaged-group.component.html'
})
export class TopEngagedGroupComponent implements OnInit {
  @Input() height;
  @Input() type;
  @Input() challengeId;
  dataRows = [];
  constructor(
    private communityApi: CommunityApi,
    private ngRedux: NgRedux<AppState>,
    private challengesApiService: ChallengesApiService
  ) {}

  ngOnInit() {
    if (this.type == TOP_USER_TYPE.COMMUNITY) {
      this.getCommunityTopGroups();
    } else if (this.type == TOP_USER_TYPE.CHALLENGE && this.challengeId) {
      this.getChallengeTopGroups();
    }
  }

  getChallengeTopGroups() {
    const params = {
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    this.challengesApiService
      .getTopGroups(this.challengeId, params)
      .subscribe((res: any) => {
        this.dataRows = res.response;
      });
  }

  getCommunityTopGroups() {
    this.communityApi.getCommunityTopGroups().subscribe((res: any) => {
      this.dataRows = res.response;
    });
  }

  ordinalSuffixOf(i) {
    let j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + 'st';
    }
    if (j == 2 && k != 12) {
      return i + 'nd';
    }
    if (j == 3 && k != 13) {
      return i + 'rd';
    }
    return i + 'th';
  }
  getRankChangedIcon(number) {
    if (number && number > 0) {
      return 'caret-up';
    } else if (number && number < 0) {
      return 'caret-down';
    }
  }
}
