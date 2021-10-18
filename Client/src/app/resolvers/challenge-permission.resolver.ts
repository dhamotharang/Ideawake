import { get } from 'lodash';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { RoleAndPermissionsApi } from '../services';

@Injectable()
export class ChallengePermissionResolver implements Resolve<any> {
  constructor(private roleAndPermissionsApi: RoleAndPermissionsApi) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.roleAndPermissionsApi.getUserPermissionsInChallenge(
      get(route, 'params.id', null)
    );
  }
}
