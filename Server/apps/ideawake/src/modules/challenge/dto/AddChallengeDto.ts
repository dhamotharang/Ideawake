'use strict';

import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsInt,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddEntityExperienceSettingDto } from '../../entityExperienceSetting/dto/AddEntityExperienceSettingDto';
import { AddEntityVisibilitySettingDto } from '../../entityVisibilitySetting/dto';
import {
  AddChallengePrizeDto,
  ChallengeParticipantDto,
  ChallengeSubFormFieldsDto,
} from '.';

export class AddChallengeDto {
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
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
  prizes: AddChallengePrizeDto[];

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
  oldPlatformId: string;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  subFormFields: ChallengeSubFormFieldsDto[];

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  postTitlePlaceholder: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  postDescPlaceholder: string;
}
