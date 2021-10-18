import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { IntegrationRepository } from './integration.repository';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { CommunityModule } from '../community/community.module';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { PermissionsService } from '../../shared/services/permissions.service';
import { AuthIntegrationService } from './authIntegration.service';
import { AuthIntegrationController } from './authIntegration.controller';
import { AuthIntegrationRepository } from './authIntegration.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IntegrationRepository,
      AuthIntegrationRepository,
    ]),
    forwardRef(() => CommunityModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => ChallengeModule),
  ],
  controllers: [IntegrationController, AuthIntegrationController],
  exports: [IntegrationService, AuthIntegrationService],
  providers: [
    IntegrationService,
    AuthIntegrationService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    PermissionsService,
  ],
})
export class IntegrationModule {}
