import { Controller, Get, Param } from '@nestjs/common';

import { OpportunityTypePostingExperienceService } from './opportunityTypePostingExperience.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('opportunity-type-posting-experience')
export class OpportunityTypePostingExperienceController {
  constructor(
    private readonly opportunityTypePostingExperienceService: OpportunityTypePostingExperienceService,
  ) {}

  @Get()
  async getAllOpportunityTypePostingExperiences(): Promise<ResponseFormat> {
    const options = {};
    const opportunityTypePostingExperiences = await this.opportunityTypePostingExperienceService.getOpportunityTypePostingExperiences(
      options,
    );
    return ResponseFormatService.responseOk(
      opportunityTypePostingExperiences,
      'All',
    );
  }

  @Get(':id')
  async getOpportunityTypePostingExperience(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const opportunityTypePostingExperience = await this.opportunityTypePostingExperienceService.getOpportunityTypePostingExperiences(
      { id: id },
    );
    return ResponseFormatService.responseOk(
      opportunityTypePostingExperience,
      'All',
    );
  }
}
