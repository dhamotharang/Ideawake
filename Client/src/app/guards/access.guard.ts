import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  CanActivateChild
} from '@angular/router';

import { AppState } from '../store';

@Injectable()
export class AccessGuard implements CanActivate, CanActivateChild {
  constructor(private ngRedux: NgRedux<AppState>, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAdmin: boolean =
      this.ngRedux.getState().userState.userCommunityPermissions[
        next.data.setting
      ] === 2;
    if (!isAdmin) {
      this.router.navigateByUrl('/error/404');
    }
    return isAdmin;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // invoking the canActivate by passing route and state
    return this.canActivate(route, state);
  }
}
