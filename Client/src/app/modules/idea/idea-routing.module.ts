import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards';
import { IdeaResolver } from '../../resolvers';
import {
  IdeaboxContainerComponent,
  IdeaFilesContainerComponent,
  IdeaFiltersComponent,
  IdeaPageContainerComponent,
  IdeasListBubblesComponent,
  IdeasListCardComponent,
  IdeasListContainerComponent,
  IdeasListPipelineComponent
} from './components';
import { IdeaLearningModuleComponent } from './components/idea-learning-module/idea-learning-module.component';

const routes: Routes = [
  { path: 'filter', canActivate: [AuthGuard], component: IdeaFiltersComponent },
  {
    path: 'box',
    canActivate: [AuthGuard],
    component: IdeaboxContainerComponent
  },
  {
    path: 'table',
    canActivate: [AuthGuard],
    component: IdeasListContainerComponent
  },
  {
    path: 'cards',
    canActivate: [AuthGuard],
    component: IdeasListCardComponent
  },
  {
    path: 'bubbles',
    canActivate: [AuthGuard],
    component: IdeasListBubblesComponent
  },
  {
    path: 'pipeline',
    canActivate: [AuthGuard],
    component: IdeasListPipelineComponent
  },
  {
    path: 'learning',
    canActivate: [AuthGuard],
    component: IdeaLearningModuleComponent
  },
  {
    path: 'view/:id',
    canActivate: [AuthGuard],
    component: IdeaPageContainerComponent,
    resolve: {
      ideaDetails: IdeaResolver
    }
  },
  {
    path: ':id/files',
    canActivate: [AuthGuard],
    component: IdeaFilesContainerComponent
  }
  // { path: 'post', component: PostIdeaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdeaRoutingModule {}
