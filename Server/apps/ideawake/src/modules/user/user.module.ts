import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { UserRepository } from './user.repository';
import { AuthService } from '../../modules/auth/auth.service';
import { PasswordModule } from '../password/password.module';
import { CommunityModule } from '../community/community.module';
import { TenantModule } from '../tenant/tenant.module';
import { InviteModule } from '../invite/invite.module';
import { InviteGateway } from '../invite/invite.gateway';
import { EmailModule } from '../email/email-template.module';
import { TagModule } from '../tag/tag.module';
import { TagService } from '../tag/tag.service';
import { TagRepository } from '../tag/tag.repository';
import { UserAttachmentModule } from '../userAttachment/userAttachment.module';
import { UserAttachmentService } from '../userAttachment/userAttachment.service';
import { UserAttachmentRepository } from '../userAttachment/userAttachment.repository';
import { OpportunityService } from '../opportunity/opportunity.service';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { OpportunityRepository } from '../opportunity/opportunity.repository';
import { VoteModule } from '../vote/vote.module';
import { VoteService } from '../vote/vote.service';
import { VoteRepository } from '../vote/vote.repository';
import { CommentModule } from '../comment/comment.module';
import { CommentService } from '../comment/comment.service';
import { CommentRepository } from '../comment/comment.repository';
import { FollowingContentService } from '../followingContent/followingContent.service';
import { FollowingContentModule } from '../followingContent/followingContent.module';
import { FollowingContentRepository } from '../followingContent/followingContent.repository';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { CircleModule } from '../circle/circle.module';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { RoleModule } from '../role/role.module';
import { IntegrationModule } from '../integration/integration.module';
import { StageAssigneeService } from '../stage/stageAssigneeSettings.service';
import { StageNotificationSettingService } from '../stage/stageNotificationSetting.service';
import { StageAssignmentSettingService } from '../stage/stageAssignmentSettings.service';
import { StageAssigneeSettingsRepository } from '../stage/stageAssigneeSettings.repository';
import { StageNotificationSettingRepository } from '../stage/stageNotificationSetting.repository';
import { StageAssignmentSettingsRepository } from '../stage/stageAssignmentSettings.repository';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { APP_GUARD } from '@nestjs/core';
import { ChallengeModule } from '../challenge/challenge.module';
import { UserActionPointRepository } from '../userActionPoint/userActionPoint.repository';
import { UserActionPointService } from '../userActionPoint/userActionPoint.service';
import { UserCircleService } from './userCircle.service';
import { UserCircleRepository } from './userCircle.repository';
import { UserCommunityRepository } from './userCommunity.repository';
import { UserCommunityService } from './userCommunity.service';
import { BlacklistEmailRepository } from './blacklistEmail.repository';
import { BlacklistEmailService } from './blacklistEmail.service';

@Module({
  imports: [
    forwardRef(() => CommunityModule),
    forwardRef(() => TenantModule),
    forwardRef(() => PasswordModule),
    forwardRef(() => InviteModule),
    forwardRef(() => EmailModule),
    forwardRef(() => TagModule),
    forwardRef(() => UserAttachmentModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => VoteModule),
    forwardRef(() => CommentModule),
    forwardRef(() => FollowingContentModule),
    forwardRef(() => CircleModule),
    forwardRef(() => RoleActorsModule),
    forwardRef(() => RoleModule),
    forwardRef(() => IntegrationModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => RoleActorsModule),
    TypeOrmModule.forFeature([
      UserRepository,
      TagRepository,
      UserAttachmentRepository,
      OpportunityRepository,
      VoteRepository,
      CommentRepository,
      FollowingContentRepository,
      StageAssigneeSettingsRepository,
      StageNotificationSettingRepository,
      StageAssignmentSettingsRepository,
      UserActionPointRepository,
      UserCircleRepository,
      UserCommunityRepository,
      BlacklistEmailRepository,
    ]),
  ],
  controllers: [UsersController],
  exports: [
    UserService,
    UserCircleService,
    UserCommunityService,
    UserAttachmentService,
    BlacklistEmailService,
  ],
  providers: [
    UserService,
    AuthService,
    InviteGateway,
    TagService,
    UserAttachmentService,
    OpportunityService,
    VoteService,
    CommentService,
    FollowingContentService,
    MicroServiceClient,
    StageAssigneeService,
    StageNotificationSettingService,
    StageAssignmentSettingService,
    UserActionPointService,
    UserCircleService,
    UserCommunityService,
    BlacklistEmailService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class UserModule {}
