import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { WorkflowApiService } from '../services';

@Injectable()
export class WorkflowActionItemsResolver implements Resolve<any> {
  constructor(private service: WorkflowApiService) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.service.getActionItem();
  }
}
