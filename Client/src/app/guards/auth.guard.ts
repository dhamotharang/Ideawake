import { map } from 'rxjs/operators';

import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_DATA,
  LOAD_USER_PERMISSIONS,
  LOAD_ALL_ENTITIES
} from '../actions';
import {
  RoleAndPermissionsApi,
  StorageService,
  AuthService
} from '../services';
import { AppState, STATE_TYPES } from '../store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private storage: StorageService,
    private authService: AuthService,
    private ngRedux: NgRedux<AppState>,
    private roleAndPermissionApi: RoleAndPermissionsApi
  ) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.ngRedux.select(STATE_TYPES.userState).pipe(
      map((userState: any) => {
        if (userState.user.id) {
          return true;
        } else {
          const user = this.storage.getItem('currentUser');
          const community = this.storage.getItem('selectedCommunity');
          const permissions = this.storage.getItem('communityPermissions');
          const communityAppearance = this.storage.getItem(
            'communityAppearance'
          );
          const entities = this.storage.getItem('entities');
          if (user) {
            if (!community) {
              this.router.navigate(['/auth/login'], {
                queryParams: { redirectTo: document.location.href }
              });
              return false;
            } else {
              this.ngRedux.dispatch({
                type: CHANGE_CURRENT_COMMUNITY,
                currentCommunityId: community
              });
              this.ngRedux.dispatch({
                type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
                communityAppearance
              });
            }
            this.ngRedux.dispatch({ type: LOAD_USER_DATA, user });
            this.ngRedux.dispatch({ type: LOAD_ALL_ENTITIES, entities });
            if (!permissions) {
              this.roleAndPermissionApi
                .getUserPermissionsInCommunity()
                .subscribe((res: any) => {
                  this.ngRedux.dispatch({
                    type: LOAD_USER_PERMISSIONS,
                    userCommunityPermissions: res.response
                  });
                });
            } else {
              this.ngRedux.dispatch({
                type: LOAD_USER_PERMISSIONS,
                userCommunityPermissions: permissions
              });
            }
            return true;
          } else {
            this.router.navigate(['/auth/login'], {
              queryParams: { redirectTo: document.location.href }
            });
            return false;
          }
        }
      })
    );
  }
}
