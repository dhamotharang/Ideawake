import { APP_GUARD } from '@nestjs/core';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrizeRepository } from './prize.repository';
import { PrizeController } from './prize.controller';
import { PrizeService } from './prize.service';
import { PrizeCategoryRepository } from './prizeCategory.repository';
import { ChallengeModule } from '../challenge/challenge.module';
import { CommunityModule } from '../community/community.module';
import { CircleModule } from '../circle/circle.module';
import { PrizeAwardeeRepository } from './prizeAwardee.repository';
import { UserModule } from '../user/user.module';
import { OpportunityUserModule } from '../opportunityUser/opportunityUser.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PermissionsService } from '../../shared/services/permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrizeRepository,
      PrizeCategoryRepository,
      PrizeAwardeeRepository,
    ]),
    forwardRef(() => ChallengeModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => CircleModule),
    forwardRef(() => UserModule),
    forwardRef(() => OpportunityUserModule),
    forwardRef(() => OpportunityModule),
  ],
  controllers: [PrizeController],
  exports: [PrizeService],
  providers: [
    PrizeService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    PermissionsService,
  ],
})
export class PrizeModule {}
