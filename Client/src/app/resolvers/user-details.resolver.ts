import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { ApiService, StorageService } from '../services';

@Injectable()
export class UserDetailResolver implements Resolve<any> {
  constructor(
    private apiService: ApiService,
    private storage: StorageService
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    const userId = this.storage.getUser();
    return this.apiService
      .get(`/users/${userId}`)
      .toPromise()
      .then((res: any) => res.response[0]);
  }
}
