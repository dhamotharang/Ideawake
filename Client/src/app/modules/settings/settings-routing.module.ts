import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccessGuard, AuthGuard } from '../../guards';
import { ACCESS_ROUTE_PERMISSIONS } from '../../utils';
import {
  BillingAndPlanComponent,
  CommunityAppearanceSettingsComponent,
  CommunityBasicSettingsComponent,
  CommunityGamificationContainerComponent,
  InvitesPendingComponent,
  InvitesSendComponent,
  PointsManageComponent,
  ResetPasswordComponent,
  SecurityComponent,
  UsersListContainerComponent
} from './components';
import { MobileNavigationComponent } from './components/mobile-navigation/mobile-navigation.component';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  {
    path: 'all',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: SettingsComponent
  },
  {
    path: 'gamification',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: CommunityGamificationContainerComponent
  },
  {
    path: 'invites-pending',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: InvitesPendingComponent
  },
  {
    path: 'users-list',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: UsersListContainerComponent
  },
  {
    path: 'send-invites',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: InvitesSendComponent
  },
  {
    path: 'security',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSecuritySettings },
    component: SecurityComponent
  },
  {
    path: 'mobile-navigation',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSecuritySettings },
    component: MobileNavigationComponent
  },
  {
    path: 'manage-points',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessPointsSettings },
    component: PointsManageComponent
  },
  {
    path: 'billing-and-plan',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.manageBillingAndPlan },
    component: BillingAndPlanComponent
  },
  { path: 'update-password/:resetCode', component: ResetPasswordComponent },
  {
    path: 'community/basic',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessBasicSettings },
    component: CommunityBasicSettingsComponent
  },
  {
    path: 'community/appearance',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessAppearanceSettings },
    component: CommunityAppearanceSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
