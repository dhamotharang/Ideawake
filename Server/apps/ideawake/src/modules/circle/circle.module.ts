import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircleRepository } from './circle.repository';
import { CircleController } from './circle.controller';
import { CircleService } from './circle.service';
import { AuthService } from '../../modules/auth/auth.service';
import { UserModule } from '../user/user.module';
import { InviteModule } from '../invite/invite.module';
import { TagModule } from '../tag/tag.module';
import { TagService } from '../tag/tag.service';
import { TagRepository } from '../tag/tag.repository';
import { IntegrationModule } from '../integration/integration.module';
import { CommunityService } from '../community/community.service';
import { CommunityRepository } from '../community/community.repository';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { RoleService } from '../role/role.service';
import { CommunityWisePermissionService } from '../communityWisePermission/communityWisePermission.service';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { RoleActorsRepository } from '../roleActors/roleActors.repository';
import { RoleRepository } from '../role/role.repository';
import { CommunityWisePermissionRepository } from '../communityWisePermission/communityWisePermission.repository';
import { EntityExperienceSettingRepository } from '../entityExperienceSetting/entityExperienceSetting.repository';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';

@Module({
  imports: [
    forwardRef(() => InviteModule),
    forwardRef(() => UserModule),
    forwardRef(() => TagModule),
    forwardRef(() => IntegrationModule),
    TypeOrmModule.forFeature([
      CircleRepository,
      TagRepository,
      CommunityRepository,
      RoleActorsRepository,
      RoleRepository,
      CommunityWisePermissionRepository,
      EntityExperienceSettingRepository,
    ]),
  ],
  controllers: [CircleController],
  exports: [CircleService, TagService],
  providers: [
    CircleService,
    AuthService,
    TagService,
    CommunityService,
    RoleActorsService,
    RoleService,
    CommunityWisePermissionService,
    EntityExperienceSettingService,
    MicroServiceClient,
  ],
})
export class CircleModule {}
