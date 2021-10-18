import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { VoteModule } from '../vote/vote.module';
import { CommentModule } from '../comment/comment.module';
import { ShareModule } from '../share/share.module';
import { UserActionPointModule } from '../userActionPoint/userActionPoint.module';
import { CustomFieldModule } from '../customField/customField.module';
import { EntityExperienceSettingModule } from '../entityExperienceSetting/entityExperienceSetting.module';
import { SharedService } from '../../shared/services/shared.services';
import { OpportunityTypeModule } from '../opportunityType/opportunityType.module';
import { StageModule } from '../stage/stage.module';
import { StatusModule } from '../status/status.module';
import { UserModule } from '../user/user.module';
import { CircleModule } from '../circle/circle.module';
import { OpportunityUserModule } from '../opportunityUser/opportunityUser.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    OpportunityModule,
    ChallengeModule,
    VoteModule,
    CommentModule,
    ShareModule,
    UserActionPointModule,
    UserModule,
    OpportunityTypeModule,
    CircleModule,
    forwardRef(() => StatusModule),
    forwardRef(() => StageModule),
    forwardRef(() => CustomFieldModule),
    forwardRef(() => EntityExperienceSettingModule),
    forwardRef(() => OpportunityUserModule),
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
  providers: [AnalyticsService, SharedService],
})
export class AnalyticsModule {}
