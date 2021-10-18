import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CDKModule } from '../../cdk-module';
import { WorkflowActionItemsResolver } from '../../resolvers';
import { StatusApiService, WorkflowApiService } from '../../services';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { ReviewsModule } from '../reviews/reviews.module';
import {
  WorkflowAddComponent,
  WorkflowListContainerComponent,
  WorkflowStageAddComponent,
  WorkflowStageAssignComponent,
  WorkflowStageBasicInformationComponent,
  WorkflowStageCompletionSettingsComponent,
  WorkflowStageListComponent,
  WorkflowStagePairwiseComponent,
  WorkflowStageProjectComponent,
  WorkflowStageRefineComponent,
  WorkflowStageScorecardComponent,
  WorkflowStageSettingsComponent,
  ScorecardListComponent,
  WorkflowStageSurveyComponent,
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent,
  AddEditChallengeWorkflowComponent,
  WorkflowStageListSimpleComponent,
  StageCompletedNotificationComponent,
  SelectStageMembersComponent,
  StageAssignByCustomFiledComponent,
  SelectMembersComponent
} from './components';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowSelectComponent } from './components/workflow-select/workflow-select.component';
import { CommunityNavigationModule } from '../community/community-navigation.module';
import { MediaModule } from '../media/media.module';
import { I18nModule } from '../i18n/i18n.module';
import { SearchModule } from '../search/search.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    WorkflowAddComponent,
    WorkflowListContainerComponent,
    WorkflowStageAddComponent,
    WorkflowStagePairwiseComponent,
    WorkflowStageProjectComponent,
    WorkflowStageRefineComponent,
    WorkflowStageScorecardComponent,
    WorkflowStageSettingsComponent,
    WorkflowStageBasicInformationComponent,
    WorkflowStageAssignComponent,
    WorkflowStageCompletionSettingsComponent,
    WorkflowStageSurveyComponent,
    WorkflowStageListComponent,
    ScorecardListComponent,
    AddEditChallengeWorkflowComponent,
    AddEditWorkFlowModalComponent,
    AddEditChallengeWorkflowComponent,
    WorkflowChangeStageModalComponent,
    WorkflowStageListSimpleComponent,
    WorkflowSelectComponent,
    StageCompletedNotificationComponent,
    SelectStageMembersComponent,
    StageAssignByCustomFiledComponent,
    SelectMembersComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    WorkflowRoutingModule,
    FontAwesomeModule,
    DragDropModule,
    CDKModule,
    CustomFieldsModule,
    ReviewsModule,
    CommunityNavigationModule,
    MediaModule,
    I18nModule,
    SearchModule,
    NgbModule
  ],
  providers: [
    WorkflowApiService,
    StatusApiService,
    WorkflowActionItemsResolver
  ],
  entryComponents: [
    AddEditWorkFlowModalComponent,
    WorkflowChangeStageModalComponent
  ],
  exports: [
    AddEditChallengeWorkflowComponent,
    WorkflowStageListSimpleComponent,
    WorkflowSelectComponent,
    SelectMembersComponent
  ]
})
export class WorkflowModule {}
