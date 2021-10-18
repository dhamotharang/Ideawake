import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../../modules/user/user.module';
import { TagRepository } from './tag.repository';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { OpportunityRepository } from '../opportunity/opportunity.repository';
import { OpportunityService } from '../opportunity/opportunity.service';
import { StageAssigneeService } from '../stage/stageAssigneeSettings.service';
import { StageNotificationSettingService } from '../stage/stageNotificationSetting.service';
import { StageAssignmentSettingService } from '../stage/stageAssignmentSettings.service';
import { StageAssigneeSettingsRepository } from '../stage/stageAssigneeSettings.repository';
import { StageNotificationSettingRepository } from '../stage/stageNotificationSetting.repository';
import { StageAssignmentSettingsRepository } from '../stage/stageAssignmentSettings.repository';
import { CommunityModule } from '../community/community.module';
import { CircleModule } from '../circle/circle.module';
import { CommentModule } from '../comment/comment.module';
@Module({
  imports: [
    forwardRef(() => SharedModule),
    forwardRef(() => UserModule),
    forwardRef(() => OpportunityModule),
    TypeOrmModule.forFeature([TagRepository]),
    TypeOrmModule.forFeature([
      OpportunityRepository,
      StageAssigneeSettingsRepository,
      StageNotificationSettingRepository,
      StageAssignmentSettingsRepository,
    ]),
    forwardRef(() => CommunityModule),
    forwardRef(() => CircleModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [TagController],
  exports: [TagService],
  providers: [
    TagService,
    OpportunityService,
    StageAssigneeService,
    StageNotificationSettingService,
    StageAssignmentSettingService,
  ],
})
export class TagModule {}
