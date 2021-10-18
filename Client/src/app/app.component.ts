import { Angulartics2Segment } from 'angulartics2/segment';
import { first } from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { SHOW_ACTIVITY_INDICATOR } from './actions';
import { CommunityApi } from './services';
import { AppState } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [CommunityApi]
})
export class AppComponent implements OnInit, AfterViewInit {
  loggedIn: boolean;
  stateSubscription: Subscription;
  @Input() hideFooter: boolean;

  constructor(
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private angulartics2Segment: Angulartics2Segment
  ) {
    this.changeAppLoaderStatus(true);
    this.loggedIn = false;
    this.angulartics2Segment.startTracking();
  }

  private includesUrl(url) {
    return (
      first(url.split('?')).includes('/auth/login') ||
      first(url.split('?')).includes('/auth/search-url') ||
      url.includes('/auth/community') ||
      url.includes('/auth/register') ||
      url.includes('/community/add') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/settings/update-password') ||
      url.includes('/community/select') ||
      url.includes('/community/accept/invite/') ||
      url.includes('/error/shared-machine')
    );
  }

  ngOnInit() {
    // on route change to '/login', set the variable showHead to false
    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if (this.includesUrl(event.url)) {
          this.loggedIn = false;
        } else {
          this.loggedIn = true;
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.changeAppLoaderStatus(false), 0);
  }

  changeAppLoaderStatus(status: boolean) {
    this.ngRedux.dispatch({
      type: SHOW_ACTIVITY_INDICATOR,
      indicator: status
    });
  }
}
