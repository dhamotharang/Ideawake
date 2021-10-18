import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  InsightAddComponent,
  InsightPageContainerComponent,
  InsightsListContainerComponent
} from './components';
import { AuthGuard } from '../../guards';

const routes: Routes = [
  {
    path: '',
    component: InsightsListContainerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'page',
    component: InsightPageContainerComponent,
    canActivate: [AuthGuard]
  },
  { path: 'add', component: InsightAddComponent, canActivate: [AuthGuard] },
  {
    path: 'list',
    component: InsightsListContainerComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsightsRoutingModule {}
