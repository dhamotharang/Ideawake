import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { AppState, STATE_TYPES, UserState } from '../../store';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  userCommunityPermissions;
  private sub: Subscription;

  constructor(private ngRedux: NgRedux<AppState>) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.userCommunityPermissions = userState.userCommunityPermissions;
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
