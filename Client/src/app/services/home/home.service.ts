import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';

import { AppState } from '../../store';
import { ApiService } from '../backend.service';

@Injectable()
export class HomeApi {
  currentUser = this.ngRedux.getState().userState.user.id;
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}
}
