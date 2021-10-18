import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';

import { OpportunityApiService } from '../services';

@Injectable()
export class IdeaResolver implements Resolve<any> {
  constructor(
    private opportunityApi: OpportunityApiService,
    private router: Router
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.opportunityApi
      .getAllCommunityOpportunities({
        isDeleted: false,
        id: route.params.id
      })
      .pipe(
        catchError((err, caught) => {
          this.router.navigateByUrl('/error/access-denied');
          return caught;
        })
      );
  }
}
