import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { Injectable } from '@angular/core';
import { RoleAndPermissionsApi } from '../services';

@Injectable()
export class EditChallengeAccessGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private roleAndPermissionsApi: RoleAndPermissionsApi
  ) {}

  async canActivate(next: ActivatedRouteSnapshot, _STATE: RouterStateSnapshot) {
    const res: any = await this.roleAndPermissionsApi
      .getUserPermissionsInChallenge(next.params.id)
      .toPromise();
    let isAdmin = false;
    if (next.data.conditionAnd) {
      isAdmin = next.data.settings.every((setting) => res.response[setting]);
    } else {
      isAdmin = next.data.settings.some((setting) => res.response[setting]);
    }
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
