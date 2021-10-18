import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeModule } from '../challenge/challenge.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { UserModule } from '../user/user.module';
import { OmniSearchController } from './omnisearch.controller';
import { OmnisearchService } from './omnisearch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    forwardRef(() => UserModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => ChallengeModule),
  ],
  controllers: [OmniSearchController],
  exports: [OmnisearchService],
  providers: [OmnisearchService],
})
export class OmnisearchModule {}
