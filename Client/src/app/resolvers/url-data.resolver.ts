import { WINDOW } from '../providers';
import { Injectable, Inject } from '@angular/core';
import { Resolve } from '@angular/router';

import { AuthorizationApiService } from '../services';

@Injectable()
export class urlDataResolver implements Resolve<any> {
  constructor(
    @Inject(WINDOW) private window: any,
    private authorizationApi: AuthorizationApiService
  ) {}
  resolve() {
    return this.authorizationApi
      .getCommunityDataBeforeLogin({ url: this.window.location.hostname })
      .toPromise()
      .then((res: any) => res.response);
  }
}
