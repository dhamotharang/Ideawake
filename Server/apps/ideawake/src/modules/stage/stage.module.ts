import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StageRepository } from './stage.repository';
import { StageService } from './stage.service';
import { StageNotificationSettingRepository } from './stageNotificationSetting.repository';
import { StageAssigneeSettingsRepository } from './stageAssigneeSettings.repository';
import { StageAssignmentSettingsRepository } from './stageAssignmentSettings.repository';
import { StageAssigneeService } from './stageAssigneeSettings.service';
import { StageAssignmentSettingService } from './stageAssignmentSettings.service';
import { StageNotificationSettingService } from './stageNotificationSetting.service';
import { CommunityModule } from '../community/community.module';
import { RoleModule } from '../role/role.module';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { CustomFieldModule } from '../customField/customField.module';
import { EvaluationCriteriaModule } from '../evaluationCriteria/evaluationCriteria.module';
import { StageHistoryService } from './stageHistory.service';
import { StageHistoryRepository } from './stageHistory.repository';
import { VoteModule } from '../vote/vote.module';
import { FollowingContentModule } from '../followingContent/followingContent.module';
import { CircleModule } from '../circle/circle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StageRepository,
      StageNotificationSettingRepository,
      StageAssigneeSettingsRepository,
      StageAssignmentSettingsRepository,
      StageHistoryRepository,
    ]),
    forwardRef(() => CommunityModule),
    forwardRef(() => RoleModule),
    forwardRef(() => RoleActorsModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => CustomFieldModule),
    forwardRef(() => EvaluationCriteriaModule),
    forwardRef(() => VoteModule),
    forwardRef(() => FollowingContentModule),
    forwardRef(() => CircleModule),
  ],
  exports: [
    StageService,
    StageAssigneeService,
    StageAssignmentSettingService,
    StageNotificationSettingService,
    StageHistoryService,
  ],
  providers: [
    StageService,
    StageAssigneeService,
    StageAssignmentSettingService,
    StageNotificationSettingService,
    StageHistoryService,
  ],
})
export class StageModule {}
