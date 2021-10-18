import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ArticlePipe } from '../../pipes';
import { ChallengePermissionResolver } from '../../resolvers';
import {
  AnalyticsApiService,
  ChallengesApiService,
  PrizeApiService
} from '../../services';
import { ChartsModule } from 'ng2-charts';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CommentsModule } from '../comments/comments.module';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { GroupsModule } from '../groups/groups.module';
import { IdeaModule } from '../idea/idea.module';
import { LoadersModule } from '../loaders/loaders.module';
import { SharedModule } from '../shared/shared.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { TagMentionModule } from '../tag-mention';
import { UploadsModule } from '../uploads/uploads.module';
import { ChallengeRoutingModule } from './challenge-routing.module';
import {
  ArchiveChallengeModalComponent,
  ChallengeActivityComponent,
  ChallengeActivityListComponent,
  ChallengeAnalyticsComponent,
  ChallengeAudienceComponent,
  ChallengeBriefComponent,
  ChallengeChangePhaseComponent,
  ChallengeChangeStatusComponent,
  ChallengeDiscussionComponent,
  ChallengeEvaluationsComponent,
  ChallengeIdeasComponent,
  ChallengeIdeasListComponent,
  ChallengeLeaderboardComponent,
  ChallengeMySubmissionsComponent,
  ChallengeNavigationComponent,
  ChallengePairwiseComponent,
  ChallengeParticipantsComponent,
  ChallengePostComponent,
  ChallengeRolesContainerComponent,
  ChallengeSettingsComponent,
  ChallengesListComponent,
  ChallengeTopComponent,
  ChallengeTopSummaryComponent,
  ChallengeUpdatesComponent,
  ChallengeViewContainerComponent
} from './components';
import { WorkflowModule } from '../workflow/workflow.module';
import { CommunityNavigationModule } from '../community/community-navigation.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MediaModule } from '../media/media.module';
import { CommunityModule } from '../community/community.module';
import { UpdatesModalComponent } from '../shared/components/updates-modal/updates-modal.component';
import { AddEditChallengeWorkflowComponent } from '../workflow/components/add-edit-challenge-workflow/add-edit-challenge-workflow.component';

// @dynamic
@NgModule({
  declarations: [
    ChallengeActivityComponent,
    ChallengeActivityListComponent,
    ChallengeAnalyticsComponent,
    ChallengeAudienceComponent,
    ChallengeBriefComponent,
    ChallengeChangePhaseComponent,
    ChallengeDiscussionComponent,
    ChallengeEvaluationsComponent,
    ChallengeIdeasComponent,
    ChallengeLeaderboardComponent,
    ChallengeMySubmissionsComponent,
    ChallengeNavigationComponent,
    ChallengePairwiseComponent,
    ChallengeParticipantsComponent,
    ChallengePostComponent,
    ChallengeRolesContainerComponent,
    ChallengeSettingsComponent,
    ChallengesListComponent,
    ChallengeTopComponent,
    ChallengeTopSummaryComponent,
    ChallengeUpdatesComponent,
    ChallengeViewContainerComponent,
    ChallengeIdeasListComponent,
    ArchiveChallengeModalComponent,
    ChallengeChangeStatusComponent,
    ArticlePipe
  ],
  imports: [
    CommonModule,
    ChallengeRoutingModule,
    SharedModule,
    UploadsModule,
    SocialActivityModule,
    CommentsModule,
    IdeaModule,
    GroupsModule,
    CommunityNavigationModule,
    ReactiveFormsModule,
    FormsModule,
    EditorModule,
    TagMentionModule,
    LoadersModule,
    AnalyticsModule,
    CustomFieldsModule,
    InfiniteScrollModule,
    WorkflowModule,
    LazyLoadImageModule,
    MediaModule,
    ChartsModule,
    CommunityModule
  ],
  exports: [ChallengesListComponent],
  entryComponents: [
    ChallengeSettingsComponent,
    ArchiveChallengeModalComponent,
    ChallengeChangeStatusComponent,
    UpdatesModalComponent,
    ChallengeAudienceComponent,
    ChallengeBriefComponent,
    AddEditChallengeWorkflowComponent
  ],
  providers: [
    ChallengesApiService,
    PrizeApiService,
    AnalyticsApiService,
    ChallengePermissionResolver
  ]
})
export class ChallengeModule {}
