import { map } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  CLEAR_COMMUNITY_DATA,
  CLEAR_USER_DATA,
  CLEAR_USER_PERMISSIONS,
  LOAD_USER_DATA,
  CLEAR_ALL_ENTITIES
} from '../../actions';
import { AppState, STATE_TYPES } from '../../store';
import { ApiService } from '../backend.service';
import { StorageService } from '../storage/storage.service';
import { Angulartics2Segment } from 'angulartics2/segment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn;
  constructor(
    private storageService: StorageService,
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private apiService: ApiService,
    private segment: Angulartics2Segment
  ) {}

  login(emailAndPassword) {
    return this.apiService.post('/auth/user-login', emailAndPassword).pipe(
      map((res: any) => {
        this.loggedIn = true;
        res.response.user['userId'] = res.response.user.id;
        this.segment.setUserProperties(res.response.user);
        this.ngRedux.dispatch({
          type: LOAD_USER_DATA,
          user: res.response.user
        });
        return res;
      })
    );
  }

  checkLoggedIn(body) {
    return this.apiService.post('/auth/verify-login', body).pipe(
      map((res: any) => {
        this.loggedIn = true;
        return res;
      })
    );
  }

  logout(keepData = false) {
    this.loggedIn = false;
    if (!keepData) {
      this.storageService.clearAll();
      setTimeout(() => {
        this.ngRedux.dispatch({ type: CLEAR_USER_DATA });
        this.ngRedux.dispatch({ type: CLEAR_COMMUNITY_DATA });
        this.ngRedux.dispatch({ type: CLEAR_USER_PERMISSIONS });
        this.ngRedux.dispatch({ type: CLEAR_ALL_ENTITIES });
      }, 700);
    }
    this.logoutAPI().subscribe(
      (res: any) => {
        this.router.navigate(['/auth/login'], {
          queryParams: { redirectTo: document.location.href }
        });
      },
      (err: any) => {
        this.router.navigate(['/auth/login'], {
          queryParams: { redirectTo: document.location.href }
        });
      }
    );
  }

  logoutAPI() {
    return this.apiService.post(`/auth/logout`);
  }

  checkLogin() {
    return this.ngRedux.select(STATE_TYPES.userState);
  }
}
