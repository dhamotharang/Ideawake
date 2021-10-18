import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeModule } from '../challenge/challenge.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { UserModule } from '../user/user.module';
import { ElasticDataSyncController } from './elasticDataSync.controller';
import { ElasticDataSyncService } from './elasticDataSync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    forwardRef(() => UserModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => ChallengeModule),
  ],
  controllers: [ElasticDataSyncController],
  exports: [ElasticDataSyncService],
  providers: [ElasticDataSyncService],
})
export class ElasticDataSyncModule {}
