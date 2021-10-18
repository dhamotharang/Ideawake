import { AppState, CommunitySettings, STATE_TYPES } from '../../../../store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';
import { faTreeChristmas } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  communitySettings;
  sub2: Subscription;

  constructor(private ngRedux: NgRedux<AppState>) {}

  ngOnInit() {
    this.sub2 = this.ngRedux
      .select(STATE_TYPES.communitySettingsState)
      .subscribe((settings: CommunitySettings) => {
        this.communitySettings = settings.communityAppearance;
      });
  }

  ngOnDestroy() {
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }
}
