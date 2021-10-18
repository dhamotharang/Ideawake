import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementRepository } from './announcement.repository';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { AnnouncementAttachmentRepository } from './announcementAttachment.repository';
import { AnnouncementTargetingRepository } from './announcementTargeting.repository';
import { AnnouncementTargetingService } from './announcementTargeting.service';
import { AnnouncementAttachmentService } from './announcementAttachment.service';
import { EntityExperienceSettingModule } from '../entityExperienceSetting/entityExperienceSetting.module';
import { RoleModule } from '../role/role.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { UserModule } from '../user/user.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { StageModule } from '../stage/stage.module';
import { ActionItemModule } from '../actionItem/actionItem.module';
import { PermissionsService } from '../../shared/services/permissions.service';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnnouncementRepository,
      AnnouncementAttachmentRepository,
      AnnouncementTargetingRepository,
    ]),
    forwardRef(() => EntityExperienceSettingModule),
    forwardRef(() => RoleModule),
    forwardRef(() => RoleActorsModule),
    forwardRef(() => RoleActorsModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => UserModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => StageModule),
    forwardRef(() => ActionItemModule),
    forwardRef(() => CommunityModule),
  ],
  controllers: [AnnouncementController],
  exports: [
    AnnouncementService,
    AnnouncementTargetingService,
    AnnouncementAttachmentService,
  ],
  providers: [
    AnnouncementService,
    AnnouncementTargetingService,
    AnnouncementAttachmentService,
    PermissionsService,
  ],
})
export class AnnouncementModule {}
