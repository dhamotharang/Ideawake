'use strict';

import { IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DefaultSort } from '../../../enum/default-sort.enum';

export class AddEntityExperienceSettingDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityType: number;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowVoting: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowCommenting: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowSharing: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowAnonymousIdea: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowAnonymousComment: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowAnonymousVote: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  defaultAnonymousSubmissions: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  defaultAnonymousComments: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  defaultAnonymousVotes: boolean;

  // opportunityType Experience Settings

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
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allowSubmissions: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  displayAlert: boolean;

  @IsEnum(DefaultSort)
  @IsOptional()
  @ApiModelProperty()
  defaultSort: string;
}
