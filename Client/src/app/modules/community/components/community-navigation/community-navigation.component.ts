import * as _ from 'lodash';

import {
  AppState,
  CommunitySettings,
  STATE_TYPES,
  UserState
} from '../../../../store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-community-navigation',
  templateUrl: './community-navigation.component.html',
  styleUrls: ['./community-navigation.component.scss']
})
export class CommunityNavigationComponent implements OnInit, OnDestroy {
  showCommunitySettings = false;
  showTenantSettings = false;
  showTypesPropertiesSettings = false;
  userPermissionSettings;
  communitySettings;
  private sub: Subscription;
  private sub2: Subscription;

  toggleShowCommunitySettings() {
    this.showCommunitySettings = !this.showCommunitySettings;
  }

  toggleShowTenantSettings() {
    this.showTenantSettings = !this.showTenantSettings;
  }

  toggleShowTypesPropertiesSettings() {
    this.showTypesPropertiesSettings = !this.showTypesPropertiesSettings;
  }

  constructor(private ngRedux: NgRedux<AppState>) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.userPermissionSettings = userState.userCommunityPermissions;
      });

    this.sub2 = this.ngRedux
      .select(STATE_TYPES.communitySettingsState)
      .subscribe((settings: CommunitySettings) => {
        this.communitySettings = _.cloneDeep(settings.communityAppearance);
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }
}
