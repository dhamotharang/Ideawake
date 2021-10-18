import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeRepository } from './challenge.repository';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { ChallengeParticipantRepository } from './challengeParticipant.repository';

import { EntityExperienceSettingModule } from '../entityExperienceSetting/entityExperienceSetting.module';
import { EntityTypeModule } from '../entityType/entity.module';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { RoleModule } from '../role/role.module';
import { EntityVisibilitySettingModule } from '../entityVisibilitySetting/entityVisibilitySetting.module';
import { OpportunityUserModule } from '../opportunityUser/opportunityUser.module';
import { PrizeModule } from '../prize/prize.module';
import { FollowingContentModule } from '../followingContent/followingContent.module';
import { MentionModule } from '../mention/mention.module';
import { ChallengeAttachmentModule } from '../challengeAttachment/challengeAttachment.module';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';
import { CircleModule } from '../circle/circle.module';
import { CustomFieldModule } from '../customField/customField.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { VoteModule } from '../vote/vote.module';
import { StageModule } from '../stage/stage.module';
import { EvaluationCriteriaModule } from '../evaluationCriteria/evaluationCriteria.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChallengeRepository,
      ChallengeParticipantRepository,
    ]),
    EntityExperienceSettingModule,
    EntityVisibilitySettingModule,
    EntityTypeModule,
    RoleActorsModule,
    ChallengeAttachmentModule,
    RoleModule,
    forwardRef(() => OpportunityModule),
    forwardRef(() => OpportunityUserModule),
    forwardRef(() => PrizeModule),
    forwardRef(() => FollowingContentModule),
    forwardRef(() => MentionModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => UserModule),
    forwardRef(() => CircleModule),
    forwardRef(() => CustomFieldModule),
    forwardRef(() => VoteModule),
    forwardRef(() => StageModule),
    forwardRef(() => EvaluationCriteriaModule),
  ],
  controllers: [ChallengeController],
  exports: [ChallengeService],
  providers: [
    ChallengeService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class ChallengeModule {}
