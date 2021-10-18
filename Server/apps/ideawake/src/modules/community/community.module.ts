import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityRepository } from './community.repository';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityAppearanceSettingModule } from '../communityAppearanceSetting/communityAppearanceSetting.module';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { RoleModule } from '../role/role.module';
import { CommunityWisePermissionModule } from '../communityWisePermission/communityWisePermission.module';
import { CircleModule } from '../circle/circle.module';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { CommunityActionPointModule } from '../communityActionPoint/communityActionPoint.module';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { EntityExperienceSettingRepository } from '../entityExperienceSetting/entityExperienceSetting.repository';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PermissionsService } from '../../shared/services/permissions.service';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityRepository,
      EntityExperienceSettingRepository,
    ]),
    RoleModule,
    CommunityWisePermissionModule,
    forwardRef(() => CircleModule),
    forwardRef(() => RoleActorsModule),
    CommunityActionPointModule,
    forwardRef(() => TenantModule),
    forwardRef(() => UserModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => IntegrationModule),
    forwardRef(() => CommunityAppearanceSettingModule),
  ],
  controllers: [CommunityController],
  exports: [
    CommunityService,
    RoleModule,
    CommunityWisePermissionModule,
    RoleActorsModule,
    EntityExperienceSettingService,
  ],
  providers: [
    CommunityService,
    MicroServiceClient,
    EntityExperienceSettingService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    PermissionsService,
  ],
})
export class CommunityModule {}
