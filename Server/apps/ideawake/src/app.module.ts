import { MailerModule } from '@nest-modules/mailer';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthMiddleware } from './middlewares';
import { AuthModule } from './modules/auth/auth.module';
import { CircleModule } from './modules/circle/circle.module';
import { CommunityModule } from './modules/community/community.module';
import { DomainModule } from './modules/domain/domain.module';
import { EmailModule } from './modules/email/email-template.module';
import { InviteModule } from './modules/invite/invite.module';
import { LanguageModule } from './modules/language/language.module';
import { PasswordModule } from './modules/password/password.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ThemeModule } from './modules/theme/theme.module';
import { UserModule } from './modules/user/user.module';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { TagModule } from './modules/tag/tag.module';
import { ShortcutModule } from './modules/shortcuts/shortcut.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { FollowingContentModule } from './modules/followingContent/followingContent.module';
import { ActionTypeModule } from './modules/actionType/actionType.module';
import { OpportunityModule } from './modules/opportunity/opportunity.module';
import { OpportunityTypeModule } from './modules/opportunityType/opportunityType.module';
import { OpportunityAttachmentModule } from './modules/opportunityAttachment/opportunityAttachment.module';
import { CommunitySettingModule } from './modules/communitySetting/communitySetting.module';
import { RoleModule } from './modules/role/role.module';
import { CommunityBasePermissionModule } from './modules/communityBasePermission/communityBasePermission.module';
import { UserAttachmentModule } from './modules/userAttachment/userAttachment.module';
import { VoteModule } from './modules/vote/vote.module';
import { CommentModule } from './modules/comment/comment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ActivityLogModule } from './modules/activityLog/activityLog.module';
import { EmailTemplateModule } from './modules/emailTemplate/emailTemplate.module';
import { OpportunityTypePostingExperienceModule } from './modules/opportunityTypePostingExperience/opportunityTypePostingExperience.module';
import { CommunityAppearanceSettingModule } from './modules/communityAppearanceSetting/communityAppearanceSetting.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { RoleActorsModule } from './modules/roleActors/roleActors.module';
import { EntityExperienceSettingModule } from './modules/entityExperienceSetting/entityExperienceSetting.module';
import { CommunityWisePermissionModule } from './modules/communityWisePermission/communityWisePermission.module';
import { ShareModule } from './modules/share/share.module';
import { CommunityActionPointModule } from './modules/communityActionPoint/communityActionPoint.module';
import { UserActionPointModule } from './modules/userActionPoint/userActionPoint.module';
import { OpportunityUserModule } from './modules/opportunityUser/opportunityUser.module';
import { HealthModule } from './modules/healthCheck/healthCheck.module';
import { EntityVisibilitySettingModule } from './modules/entityVisibilitySetting/entityVisibilitySetting.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrizeModule } from './modules/prize/prize.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { StatusModule } from './modules/status/status.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { MentionModule } from './modules/mention/mention.module';
import { MetaGraberModule } from './modules/metaGraber/metaGraber.module';
import { ActionItemModule } from './modules/actionItem/actionItem.module';
import { StageModule } from './modules/stage/stage.module';
import { CustomFieldModule } from './modules/customField/customField.module';
import { EvaluationCriteriaModule } from './modules/evaluationCriteria/evaluationCriteria.module';
import { FilterOptionModule } from './modules/filterOption/filterOption.module';
import { OmnisearchModule } from './modules/omnisearch/omnisearch.module';
import { ElasticDataSyncModule } from './modules/elasticDataSync/elasticDataSync.module';
import { BookmarkedViewModule } from './modules/bookmarkedView/bookmarkedView.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HooksSubscriptionModule } from './modules/hooksSubscription/hooksSubscription.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { TranslationModule } from './modules/translation/translation.module';
import { ColumnOptionModule } from './modules/columnOption/columnOption.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
    TenantModule,
    CommunityModule,
    CircleModule,
    InviteModule,
    EmailModule,
    PasswordModule,
    ThemeModule,
    LanguageModule,
    DomainModule,
    TagModule,
    ShortcutModule,
    BookmarkModule,
    FollowingContentModule,
    ActionTypeModule,
    OpportunityModule,
    OpportunityTypeModule,
    OpportunityAttachmentModule,
    CommunitySettingModule,
    CommunityBasePermissionModule,
    RoleModule,
    UserAttachmentModule,
    VoteModule,
    CommentModule,
    NotificationModule,
    ActivityLogModule,
    EmailTemplateModule,
    OpportunityTypePostingExperienceModule,
    CommunityAppearanceSettingModule,
    ChallengeModule,
    RoleActorsModule,
    EntityExperienceSettingModule,
    CommunityWisePermissionModule,
    ShareModule,
    CommunityActionPointModule,
    UserActionPointModule,
    OpportunityUserModule,
    HealthModule,
    EntityVisibilitySettingModule,
    AnalyticsModule,
    PrizeModule,
    WorkflowModule,
    StatusModule,
    IntegrationModule,
    MentionModule,
    MetaGraberModule,
    ActionItemModule,
    StageModule,
    CustomFieldModule,
    EvaluationCriteriaModule,
    FilterOptionModule,
    OmnisearchModule,
    ElasticDataSyncModule,
    BookmarkedViewModule,
    DashboardModule,
    HooksSubscriptionModule,
    AnnouncementModule,
    TranslationModule,
    ColumnOptionModule,
    MailerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: async (configService: ConfigService) => ({
        transport: configService.mailerTransporter,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
