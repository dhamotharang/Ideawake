import { Module, forwardRef } from '@nestjs/common';
import { ActivityLogController } from './activityLog.controller';
import { ActivityLogService } from './activityLog.service';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { ChallengeModule } from '../challenge/challenge.module';
import { OpportunityModule } from '../opportunity/opportunity.module';

@Module({
  imports: [
    forwardRef(() => ChallengeModule),
    forwardRef(() => OpportunityModule),
  ],
  controllers: [ActivityLogController],
  exports: [],
  providers: [ActivityLogService, MicroServiceClient],
})
export class ActivityLogModule {}
