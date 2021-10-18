import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { AppState, STATE_TYPES } from '../../../../store';

@Component({
  selector: 'app-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss']
})
export class PageLoaderComponent implements OnInit, OnDestroy {
  showLoading;
  r: Subscription;
  constructor(private ngRedux: NgRedux<AppState>) {
    this.showLoading = false;
  }

  ngOnInit() {
    this.r = this.ngRedux
      .select(STATE_TYPES.activityIndicatorState)
      .subscribe((state: any) => {
        this.showLoading = state.activityIndicatorShown;
      });
  }

  ngOnDestroy() {
    if (this.r) {
      this.r.unsubscribe();
    }
  }
}
