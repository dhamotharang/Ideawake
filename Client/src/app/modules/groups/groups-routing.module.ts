import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards';
import {
  GroupDropdownSelectComponent,
  GroupPageContainerComponent,
  GroupsListContainerComponent
} from './components';

const routes: Routes = [
  {
    path: 'list',
    canActivate: [AuthGuard],
    component: GroupsListContainerComponent
  },
  {
    path: 'view/:id',
    canActivate: [AuthGuard],
    component: GroupPageContainerComponent
  },
  {
    path: 'select',
    canActivate: [AuthGuard],
    component: GroupDropdownSelectComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule {}
