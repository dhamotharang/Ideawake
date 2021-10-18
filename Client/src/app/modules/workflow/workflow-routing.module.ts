import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards';
import {
  WorkflowAddComponent,
  WorkflowListContainerComponent,
  WorkflowStageAddComponent,
  WorkflowStageListComponent,
  WorkflowStageSettingsComponent
} from './components';
import { WorkflowActionItemsResolver } from './../../resolvers';

const routes: Routes = [
  { path: 'add', canActivate: [AuthGuard], component: WorkflowAddComponent },
  {
    path: 'list',
    canActivate: [AuthGuard],
    component: WorkflowListContainerComponent
  },
  {
    path: 'stage-settings',
    canActivate: [AuthGuard],
    component: WorkflowStageSettingsComponent
  },
  {
    path: 'stage-list/:id',
    canActivate: [AuthGuard],
    component: WorkflowStageListComponent,
    resolve: {
      actionItems: WorkflowActionItemsResolver
    }
  },
  {
    path: ':id/stage/add',
    canActivate: [AuthGuard],
    component: WorkflowStageAddComponent,
    resolve: {
      actionItems: WorkflowActionItemsResolver
    }
  },
  {
    path: ':id/stage/edit/:stageId',
    canActivate: [AuthGuard],
    component: WorkflowStageAddComponent,
    resolve: {
      actionItems: WorkflowActionItemsResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
