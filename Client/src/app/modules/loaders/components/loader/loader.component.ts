import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { AppState, STATE_TYPES } from '../../../../store';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {
  showLoading;
  private sub: Subscription;
  constructor(private ngRedux: NgRedux<AppState>) {
    this.showLoading = false;
  }

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.activityIndicatorState)
      .subscribe((state: any) => {
        this.showLoading = state.activityIndicatorShown;
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
