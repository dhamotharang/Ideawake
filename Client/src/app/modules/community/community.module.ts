import {
  CommunityAcceptInviteComponent,
  CommunityAddNewComponent,
  CommunityAddNewOpportunityComponent,
  CommunityAnalyticsComponent,
  CommunityContainerComponent,
  CommunityCreateComponent,
  CommunityFindComponent,
  CommunityIntegrationsComponent,
  CommunityLeaderboardComponent,
  CommunityManageEmailsContainerComponent,
  CommunityNavigationComponent,
  CommunityOpportunityTypePermissionsComponent,
  CommunityOpportunityTypeSettingsComponent,
  CommunityRegisterSendInvitesComponent,
  CommunitySearchComponent,
  CommunitySelectComponent,
  ConfigureGadgetComponent,
  CreateGadgetComponent,
  FrontPageComponent,
  GroupAnalyticsComponent,
  ImpactAnalyticsComponent,
  ImportComponent,
  KnowledgeTypesComponent,
  LocationAnalyticsComponent,
  ManageCommunitiesComponent,
  NonFinancialImpactAnalyticsComponent,
  OpportunityAnalyticsComponent,
  OpportunityPropertiesComponent,
  OpportunityTypesComponent,
  OutcomeTypesComponent,
  PrivacyComponent,
  TemplatePreviewComponent,
  TermsComponent,
  UserAnalyticsComponent,
  PostUpdateComponent
} from './components';
import {
  CommunityApi,
  EmailTemplateApiService,
  SettingsApiService
} from '../../services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { urlDataResolver } from '../../resolvers';

import { ActionItemsModule } from '../action-items/action-items.module';
import { AddEditDashboardComponent } from './components/add-edit-dashboard/add-edit-dashboard.component';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CommonModule } from '@angular/common';
import { CommunityAnalyticsNavigationComponent } from './components/community-analytics-navigation/community-analytics-navigation.component';
import { CommunityCustomFieldsComponent } from './components/community-custom-fields/community-custom-fields.component';
import { CommunityNavigationModule } from './community-navigation.module';
import { CommunityRoutingModule } from './community-routing.module';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IdeaModule } from '../idea/idea.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MediaModule } from '../media/media.module';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { UploadsModule } from '../uploads/uploads.module';
import { WINDOW_PROVIDERS } from '../../providers';
import { WorkflowModule } from '../workflow/workflow.module';
import { UpdatesModalComponent } from '../shared/components/updates-modal/updates-modal.component';

// @dynamic
@NgModule({
  declarations: [
    CommunityAcceptInviteComponent,
    CommunityAddNewComponent,
    CommunityAddNewOpportunityComponent,
    CommunityAnalyticsComponent,
    CommunityContainerComponent,
    CommunityCreateComponent,
    CommunityFindComponent,
    CommunityIntegrationsComponent,
    CommunityLeaderboardComponent,
    CommunityManageEmailsContainerComponent,
    CommunityOpportunityTypePermissionsComponent,
    CommunityOpportunityTypeSettingsComponent,
    CommunityRegisterSendInvitesComponent,
    CommunitySearchComponent,
    CommunitySelectComponent,
    GroupAnalyticsComponent,
    ImpactAnalyticsComponent,
    LocationAnalyticsComponent,
    ManageCommunitiesComponent,
    OpportunityAnalyticsComponent,
    OutcomeTypesComponent,
    KnowledgeTypesComponent,
    NonFinancialImpactAnalyticsComponent,
    OpportunityTypesComponent,
    PrivacyComponent,
    TemplatePreviewComponent,
    TermsComponent,
    UserAnalyticsComponent,
    OpportunityPropertiesComponent,
    FrontPageComponent,
    CommunityCustomFieldsComponent,
    CommunityAnalyticsNavigationComponent,
    ImportComponent,
    DashboardComponent,
    PostUpdateComponent,
    AddEditDashboardComponent,
    CreateGadgetComponent,
    ConfigureGadgetComponent
  ],
  imports: [
    CommonModule,
    CommunityRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    UploadsModule,
    NgSelectModule,
    SocialActivityModule,
    AnalyticsModule,
    CustomFieldsModule,
    ActionItemsModule,
    WorkflowModule,
    CommunityNavigationModule,
    LazyLoadImageModule,
    MediaModule,
    IdeaModule
  ],
  providers: [
    CommunityApi,
    EmailTemplateApiService,
    SettingsApiService,
    WINDOW_PROVIDERS,
    urlDataResolver
  ],
  entryComponents: [
    CommunityAddNewComponent,
    CommunityAddNewOpportunityComponent,
    TemplatePreviewComponent,
    AddEditDashboardComponent,
    CreateGadgetComponent,
    ConfigureGadgetComponent,
    UpdatesModalComponent
  ]
})
export class CommunityModule {}
