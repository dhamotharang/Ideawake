import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentionRepository } from './mention.repository';
import { MentionController } from './mention.controller';
import { MentionService } from './mention.service';
import { CircleModule } from '../circle/circle.module';
import { CommunityModule } from '../community/community.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentionRepository]),
    forwardRef(() => CircleModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => OpportunityModule),
    forwardRef(() => UserModule),
  ],
  controllers: [MentionController],
  exports: [MentionService],
  providers: [MentionService],
})
export class MentionModule {}
