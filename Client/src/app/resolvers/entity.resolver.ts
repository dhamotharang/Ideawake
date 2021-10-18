import { get } from 'lodash';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { EntityApiService } from '../services';

@Injectable()
export class EntityResolver implements Resolve<any> {
  constructor(private entityApiService: EntityApiService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.entityApiService.getEntities(
      get(route, 'data.resolverData.entityResolverData', null)
    );
  }
}
