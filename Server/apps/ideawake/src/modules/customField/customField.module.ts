import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { CustomFieldRepository } from './customField.repository';
import { CustomFieldTypeRepository } from './customFieldType.repository';
import { CustomFieldController } from './customField.controller';
import { CustomFieldService } from './customField.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PermissionsService } from '../../shared/services/permissions.service';
import { RoleModule } from '../role/role.module';
import { CommunityModule } from '../community/community.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { CustomFieldIntegrationService } from './customFieldIntegration.service';
import { CustomFieldIntegrationRepository } from './customFieldIntegration.repository';
import { CustomFieldDataRepository } from './customFieldData.repository';
import { CustomFieldDataService } from './customFieldData.service';
import { OpportunityFieldLinkageService } from './opportunityFieldLinkage.service';
import { OpportunityFieldLinkageRepository } from './opportunityFieldLinkage.repository';
import { OpportunityRepository } from '../opportunity/opportunity.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomFieldRepository,
      CustomFieldTypeRepository,
      CustomFieldIntegrationRepository,
      CustomFieldDataRepository,
      OpportunityFieldLinkageRepository,
      OpportunityRepository,
    ]),
    forwardRef(() => RoleModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => ChallengeModule),
  ],
  controllers: [CustomFieldController],
  exports: [
    CustomFieldService,
    CustomFieldIntegrationService,
    CustomFieldDataService,
    OpportunityFieldLinkageService,
  ],
  providers: [
    CustomFieldService,
    CustomFieldIntegrationService,
    CustomFieldDataService,
    OpportunityFieldLinkageService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    PermissionsService,
  ],
})
export class CustomFieldModule {}
