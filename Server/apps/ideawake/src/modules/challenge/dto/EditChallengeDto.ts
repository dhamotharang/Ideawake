'use strict';

import {
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddEntityExperienceSettingDto } from '../../entityExperienceSetting/dto/AddEntityExperienceSettingDto';
import { AddEntityVisibilitySettingDto } from '../../entityVisibilitySetting/dto';
import { ChallengeStatuses } from '../../../enum/cahllenge-status.enum';
import {
  ChallengeParticipantDto,
  ChallengeSubFormFieldsDto,
  EditChallengePrizeDto,
} from '.';

export class EditChallengeDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  opportunityType: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  bannerImage: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  hasAdditionalBrief: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  additionalBrief: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  draft: boolean;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  tags: number[];

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  sponsors: number[];

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  moderators: number[];

  @IsArray()
  @IsOptional()
  participants: ChallengeParticipantDto[];

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  user: number;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @ValidateNested()
  @Type(() => AddEntityExperienceSettingDto)
  @IsOptional()
  entityExperienceSetting: AddEntityExperienceSettingDto;

  @ValidateNested()
  @Type(() => AddEntityVisibilitySettingDto)
  @IsOptional()
  submissionVisibilitySetting: AddEntityVisibilitySettingDto;

  @IsArray()
  @IsOptional()
  prizes: EditChallengePrizeDto[];

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  expiryStartDate: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  expiryEndDate: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  haveExpiry: boolean;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  attachments: [];

  @IsEnum(ChallengeStatuses)
  @IsOptional()
  @ApiModelProperty()
  status: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  workflow: number;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  enableDupDetection: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  challengeOnlyDuplicates: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  postTitlePlaceholder: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  postDescPlaceholder: string;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  subFormFields: ChallengeSubFormFieldsDto[];
}
