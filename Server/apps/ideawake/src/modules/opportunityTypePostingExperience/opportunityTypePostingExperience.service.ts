import { Injectable } from '@nestjs/common';
import { OpportunityTypePostingExperienceRepository } from './opportunityTypePostingExperience.repository';
import { OpportunityTypePostingExperienceEntity } from './opportunityTypePostingExperience.entity';

@Injectable()
export class OpportunityTypePostingExperienceService {
  constructor(
    public readonly OpportunityTypePostingExperienceRepository: OpportunityTypePostingExperienceRepository,
  ) {}

  /**
   * Get OpportunityTypePostingExperiences
   */
  async getOpportunityTypePostingExperiences(options: {}): Promise<
    OpportunityTypePostingExperienceEntity[]
  > {
    return this.OpportunityTypePostingExperienceRepository.find(options);
  }
}
