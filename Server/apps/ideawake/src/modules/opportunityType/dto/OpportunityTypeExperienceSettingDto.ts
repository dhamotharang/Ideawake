'use strict';

import { IsOptional, IsBoolean } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class OpportunityTypeExperienceSettingDto {
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowOpportunityOwnership: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  assignOpportunitySubmitterAsOwner: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowOpportunityTeams: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowTeamBasedOpportunitySubmission: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  assignOpportunitySubmitterAsContributor: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  assignMergedContributorsToParent: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowOpportunityCosubmitters: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  assignMergedCosubmittersToParent: boolean;
}
