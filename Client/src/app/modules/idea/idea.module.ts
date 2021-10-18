import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IdeaResolver } from '../../resolvers';
import {
  ActivityApiService,
  EntityApiService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  SharedApi,
  StatusApiService,
  WorkflowApiService
} from '../../services';
import { CommentsModule } from '../comments/comments.module';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { LoadersModule } from '../loaders/loaders.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SharedModule } from '../shared/shared.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { TagMentionModule } from '../tag-mention';
import { UploadsModule } from '../uploads/uploads.module';
import { ActionItemsListByProfileModule } from '../action-items/action-items-list-by-profile.module';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  AddUserComponent,
  EditIdeaComponent,
  IdeaActivityContainerComponent,
  IdeaboxContainerComponent,
  IdeaboxSetupContainerComponent,
  IdeaBulkActionsComponent,
  IdeaCategoryComponent,
  IdeaDescriptionComponent,
  IdeaEvaluationsContainerComponent,
  IdeaExportComponent,
  IdeaFilesContainerComponent,
  IdeaFilterOptionsComponent,
  IdeaFiltersComponent,
  IdeaFilterTimeComponent,
  IdeaLearningModuleComponent,
  IdeaModerateInListComponent,
  IdeaModerateWidgetComponent,
  IdeaMoreInformationContainerComponent,
  IdeaOutcomesContainerComponent,
  IdeaPageContainerComponent,
  IdeaQuestionsContainerComponent,
  IdeaRolesContainerComponent,
  IdeaSettingsPageComponent,
  IdeasListBubblesComponent,
  IdeasListCardComponent,
  IdeasListContainerComponent,
  IdeasListPipelineComponent,
  IdeasListViewOptionsComponent,
  IdeaSortOptionsComponent,
  IdeaStageProgressComponent,
  IdeaStatusComponent,
  IdeaStatusListComponent,
  IdeaStatusManageModalComponent,
  IdeaSummaryComponent,
  IdeaSummaryContainerComponent,
  IdeaTasksContainerComponent,
  IdeaTeamContainerComponent,
  IdeaTeamImagesComponent,
  IdeaTitleComponent,
  IdeaTopContainerComponent,
  InformationPopupComponent,
  PostIdeaComponent,
  IdeaAboutComponent,
  IdeaCustomFieldFiltersComponent,
  IdeaEvaluationsCriteriaComponent,
  IdeaEvaluationsStageComponent,
  IdeaBulkEditSettingsComponent
} from './components';
import { IdeaRoutingModule } from './idea-routing.module';
import { ApplicationPipesModule } from '../search/pipes.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { IdeaStageProgressHorizontalComponent } from './components/idea-stage-progress-horizontal/idea-stage-progress-horizontal.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MediaModule } from '../media/media.module';
import { DomChangedDirective } from '../../directives/dom-changed.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { IdeaEvaluationsExportComponent } from './components/idea-evaluations-export/idea-evaluations-export.component';
import { ArchiveIdeaModalComponent } from './components/archive-idea-modal/archive-idea-modal.component';
import { IdeaPipelineFeedComponent } from './components/idea-pipeline-feed/idea-pipeline-feed.component';

// @dynamic
@NgModule({
  declarations: [
    IdeaCategoryComponent,
    IdeaDescriptionComponent,
    IdeaTitleComponent,
    IdeaActivityContainerComponent,
    IdeaSummaryContainerComponent,
    IdeaboxContainerComponent,
    IdeasListContainerComponent,
    IdeaFiltersComponent,
    IdeaPageContainerComponent,
    IdeaTopContainerComponent,
    IdeaModerateWidgetComponent,
    IdeaModerateInListComponent,
    IdeaOutcomesContainerComponent,
    InformationPopupComponent,
    EditIdeaComponent,
    IdeaSummaryComponent,
    IdeaStatusComponent,
    IdeaFilesContainerComponent,
    IdeasListCardComponent,
    IdeasListViewOptionsComponent,
    IdeaFilterOptionsComponent,
    IdeaFilterTimeComponent,
    IdeaSortOptionsComponent,
    IdeaRolesContainerComponent,
    IdeaSettingsPageComponent,
    IdeaSortOptionsComponent,
    IdeaStageProgressComponent,
    IdeaStatusListComponent,
    IdeaStatusManageModalComponent,
    IdeaTasksContainerComponent,
    IdeaTeamContainerComponent,
    IdeaboxSetupContainerComponent,
    IdeaTeamImagesComponent,
    IdeaExportComponent,
    IdeaBulkActionsComponent,
    IdeaMoreInformationContainerComponent,
    IdeaEvaluationsContainerComponent,
    IdeasListBubblesComponent,
    IdeasListPipelineComponent,
    AddUserComponent,
    IdeaQuestionsContainerComponent,
    PostIdeaComponent,
    IdeaLearningModuleComponent,
    IdeaAboutComponent,
    IdeaStageProgressHorizontalComponent,
    IdeaCustomFieldFiltersComponent,
    DomChangedDirective,
    IdeaEvaluationsCriteriaComponent,
    IdeaEvaluationsStageComponent,
    IdeaBulkEditSettingsComponent,
    IdeaEvaluationsExportComponent,
    ArchiveIdeaModalComponent,
    IdeaPipelineFeedComponent
  ],
  imports: [
    CommonModule,
    IdeaRoutingModule,
    SharedModule,
    SocialActivityModule,
    CommentsModule,
    UploadsModule,
    FormsModule,
    ReactiveFormsModule,
    TagMentionModule,
    LoadersModule,
    InfiniteScrollModule,
    CustomFieldsModule,
    ReviewsModule,
    ActionItemsListByProfileModule,
    ApplicationPipesModule,
    WorkflowModule,
    LazyLoadImageModule,
    MediaModule,
    NgSelectModule,
    DragDropModule
  ],
  entryComponents: [
    EditIdeaComponent,
    IdeaSummaryComponent,
    AddUserComponent,
    PostIdeaComponent,
    IdeaEvaluationsStageComponent,
    IdeaEvaluationsCriteriaComponent,
    IdeaBulkEditSettingsComponent,
    ArchiveIdeaModalComponent
  ],
  providers: [
    SharedApi,
    OpportunityApiService,
    ActivityApiService,
    RoleAndPermissionsApi,
    EntityApiService,
    WorkflowApiService,
    StatusApiService,
    IdeaResolver
  ],
  exports: [
    PostIdeaComponent,
    IdeaTitleComponent,
    IdeaDescriptionComponent,
    IdeaActivityContainerComponent,
    IdeaSummaryContainerComponent,
    IdeaboxContainerComponent,
    IdeasListContainerComponent,
    IdeaFiltersComponent,
    IdeaPageContainerComponent,
    IdeaTopContainerComponent,
    IdeaModerateWidgetComponent,
    IdeaModerateInListComponent,
    IdeaOutcomesContainerComponent,
    InformationPopupComponent,
    EditIdeaComponent,
    IdeaSummaryComponent,
    IdeaStatusComponent,
    IdeaFilesContainerComponent,
    IdeasListCardComponent,
    IdeasListViewOptionsComponent,
    IdeaFilterOptionsComponent,
    IdeaFilterTimeComponent,
    IdeaSortOptionsComponent,
    IdeaRolesContainerComponent,
    IdeaSettingsPageComponent,
    IdeaSortOptionsComponent,
    IdeaStageProgressComponent,
    IdeaStatusListComponent,
    IdeaStatusManageModalComponent,
    IdeaTasksContainerComponent,
    IdeaTeamContainerComponent,
    IdeaboxSetupContainerComponent,
    IdeaTeamImagesComponent,
    IdeaExportComponent,
    IdeaCategoryComponent,
    AddUserComponent,
    IdeaBulkEditSettingsComponent,
    IdeaEvaluationsExportComponent
  ]
})
export class IdeaModule {}
