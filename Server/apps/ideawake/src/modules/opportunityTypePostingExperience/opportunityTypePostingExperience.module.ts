import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunityTypePostingExperienceRepository } from './opportunityTypePostingExperience.repository';
import { OpportunityTypePostingExperienceController } from './opportunityTypePostingExperience.controller';
import { OpportunityTypePostingExperienceService } from './opportunityTypePostingExperience.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpportunityTypePostingExperienceRepository]),
  ],
  controllers: [OpportunityTypePostingExperienceController],
  exports: [OpportunityTypePostingExperienceService],
  providers: [OpportunityTypePostingExperienceService],
})
export class OpportunityTypePostingExperienceModule {}
