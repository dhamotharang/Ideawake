import { AccessGuard, AuthGuard } from '../../guards';
import {
  CommunityAcceptInviteComponent,
  CommunityAddNewComponent,
  CommunityAnalyticsComponent,
  CommunityContainerComponent,
  CommunityFindComponent,
  CommunityIntegrationsComponent,
  CommunityLeaderboardComponent,
  CommunityManageEmailsContainerComponent,
  CommunityOpportunityTypeSettingsComponent,
  CommunityRegisterSendInvitesComponent,
  CommunitySearchComponent,
  CommunitySelectComponent,
  FrontPageComponent,
  GroupAnalyticsComponent,
  ImpactAnalyticsComponent,
  KnowledgeTypesComponent,
  LocationAnalyticsComponent,
  ManageCommunitiesComponent,
  NonFinancialImpactAnalyticsComponent,
  OpportunityAnalyticsComponent,
  OutcomeTypesComponent,
  PrivacyComponent,
  TermsComponent,
  UserAnalyticsComponent,
  PostUpdateComponent
} from './components';
import { RouterModule, Routes } from '@angular/router';

import { ACCESS_ROUTE_PERMISSIONS } from '../../utils';
import { ActionItemsListContainerComponent } from '../action-items/components/action-items-list-container/action-items-list-container.component';
import { CommunityCustomFieldsComponent } from './components/community-custom-fields/community-custom-fields.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ImportComponent } from './components/import/import.component';
import { NgModule } from '@angular/core';
import { urlDataResolver } from '../../resolvers';

const routes: Routes = [
  { path: 'add', component: CommunityAddNewComponent },
  {
    path: 'container',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.manageOpportunityTypes },
    component: CommunityContainerComponent
  },
  {
    path: 'community-custom-fields',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessCustomFieldSettings },
    component: CommunityCustomFieldsComponent
  },
  {
    path: 'find',
    canActivate: [AuthGuard],
    component: CommunityFindComponent
  },
  {
    path: 'send/invites',
    canActivate: [AuthGuard],
    component: CommunityRegisterSendInvitesComponent
  },
  {
    path: 'search',
    canActivate: [AuthGuard],
    component: CommunitySearchComponent
  },
  {
    path: 'select',
    canActivate: [AuthGuard],
    component: CommunitySelectComponent
  },
  {
    path: 'manage/email',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.manageScheduledEmails },
    component: CommunityManageEmailsContainerComponent
  },
  {
    path: 'accept/invite/:id',
    component: CommunityAcceptInviteComponent,
    resolve: {
      urlInfo: urlDataResolver
    }
  },
  {
    path: 'opportunity-type/:id',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.addOpportunityType },
    component: CommunityOpportunityTypeSettingsComponent
  },
  {
    path: 'leaderboard',
    canActivate: [AuthGuard],
    component: CommunityLeaderboardComponent
  },
  {
    path: 'manage-communities',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.manageCommunities },
    component: ManageCommunitiesComponent
  },
  {
    path: 'dashboard/:id',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: DashboardComponent
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessSettings },
    component: CommunityAnalyticsComponent
  },
  {
    path: 'post-update',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.manageAnnouncement },
    component: PostUpdateComponent
  },
  {
    path: 'post-update/edit/:announcementId',
    canActivate: [AuthGuard, AccessGuard],
    data: {
      setting: ACCESS_ROUTE_PERMISSIONS.manageAnnouncement
    },
    component: PostUpdateComponent
  },
  {
    path: 'group-analytics',
    canActivate: [AuthGuard],
    component: GroupAnalyticsComponent
  },
  {
    path: 'user-analytics',
    canActivate: [AuthGuard],
    component: UserAnalyticsComponent
  },
  {
    path: 'location-analytics',
    canActivate: [AuthGuard],
    component: LocationAnalyticsComponent
  },
  {
    path: 'impact-analytics',
    canActivate: [AuthGuard],
    component: ImpactAnalyticsComponent
  },
  {
    path: 'opportunity-analytics',
    canActivate: [AuthGuard],
    component: OpportunityAnalyticsComponent
  },
  {
    path: 'non-financial-impact-analytics',
    canActivate: [AuthGuard],
    component: NonFinancialImpactAnalyticsComponent
  },
  {
    path: 'outcome-types',
    canActivate: [AuthGuard],
    component: OutcomeTypesComponent
  },
  {
    path: 'knowledge-types',
    canActivate: [AuthGuard],
    component: KnowledgeTypesComponent
  },
  {
    path: 'privacy',
    canActivate: [AuthGuard],
    component: PrivacyComponent
  },
  {
    path: 'terms',
    canActivate: [AuthGuard],
    component: TermsComponent
  },
  {
    path: 'front-page',
    component: FrontPageComponent
  },
  {
    path: 'import',
    component: ImportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'integrations',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.accessIntegrations },
    component: CommunityIntegrationsComponent
  },
  {
    path: 'action-items-list-container',
    // canActivate: [AuthGuard, AccessGuard],
    // data: { setting: ACCESS_ROUTE_PERMISSIONS.accessIntegrations },
    component: ActionItemsListContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityRoutingModule {}
