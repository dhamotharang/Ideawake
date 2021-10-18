import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards';
import { ModalContainerComponent } from './modules/shared/components';

/* import { UserDetailResolver } from './resolvers'; */

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule)
    /* resolve: { data: UserDetailResolver } */
  },
  {
    path: 'auth',
    pathMatch: 'prefix',
    loadChildren: () =>
      import('./modules/authorization/authorization.module').then(
        (m) => m.AuthorizationModule
      )
  },
  {
    path: 'settings',
    pathMatch: 'prefix',
    loadChildren: () =>
      import('./modules/settings/settings.module').then((m) => m.SettingsModule)
  },
  {
    path: 'challenges',
    pathMatch: 'prefix',
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/challenge/challenge.module').then(
        (m) => m.ChallengeModule
      )
  },
  {
    path: 'community',
    pathMatch: 'prefix',
    // canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/community/community.module').then(
        (m) => m.CommunityModule
      )
  },
  {
    path: 'workflow',
    pathMatch: 'prefix',
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/workflow/workflow.module').then((m) => m.WorkflowModule)
  },
  {
    path: 'idea',
    pathMatch: 'prefix',
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/idea/idea.module').then((m) => m.IdeaModule)
  },
  {
    path: 'insights',
    pathMatch: 'prefix',
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/insights/insights.module').then((m) => m.InsightsModule)
  },
  {
    path: 'groups',
    pathMatch: 'prefix',
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/groups/groups.module').then((m) => m.GroupsModule)
  },
  {
    path: 'profile',
    pathMatch: 'prefix',
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./modules/profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'shared',
    pathMatch: 'prefix',
    loadChildren: () =>
      import('./modules/shared/shared.module').then((m) => m.SharedModule)
  },
  {
    path: 'error',
    pathMatch: 'prefix',
    loadChildren: () =>
      import('./modules/not-found/not-found.module').then(
        (m) => m.NotFoundModule
      )
  },
  {
    path: ':id/:data',
    pathMatch: 'full',
    canActivateChild: [AuthGuard],
    component: ModalContainerComponent,
    outlet: 'modal'
  },
  {
    path: '**',
    redirectTo: '/error/404'
  }
];

// @dynamic
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
