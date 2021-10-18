import { AppState, STATE_TYPES } from '../../../../store';
import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_PERMISSIONS
} from '../../../../actions';
import { CommunityApi, RoleAndPermissionsApi } from '../../../../services';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-community-select',
  templateUrl: './community-select.component.html',
  styleUrls: ['./community-select.component.scss'],
  providers: [RoleAndPermissionsApi]
})
export class CommunitySelectComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  public communities: any;
  public invites: any;
  public user;
  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private communityApi: CommunityApi,
    private roleAndPermissionsApi: RoleAndPermissionsApi
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.user = state.user;
        this.communities = state.user.communities;
        this.invites = state.user.invites;
      });
  }

  async saveCommunity(community) {
    this.ngRedux.dispatch({
      type: CHANGE_CURRENT_COMMUNITY,
      currentCommunityId: community.id
    });

    const userCommunityPermissions = await this.roleAndPermissionsApi
      .getUserPermissionsInCommunity()
      .toPromise()
      .then((res: any) => res.response);

    this.ngRedux.dispatch({
      type: LOAD_USER_PERMISSIONS,
      userCommunityPermissions
    });
    this.getAppearanceSettings();
    this.router.navigateByUrl('/');
  }

  getAppearanceSettings() {
    this.communityApi.getAppearanceSettings().subscribe((res: any) => {
      const communitySettings = res.response[0];
      this.ngRedux.dispatch({
        type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
        communityAppearance: communitySettings
      });
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
