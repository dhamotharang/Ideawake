'use strict';

import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddEntityExperienceSettingDto } from '../../entityExperienceSetting/dto';
import { MentionDto } from '../../mention/dto/MentionDto';
import { AddStageAssigneeSettingsDto } from '../../workflow/dto/AddStageAssigneeSettingsDto';
import { AddStageAssignmentSettingsDto } from '../../workflow/dto/AddStageAssignmentSettingsDto';
import { AddStageNotificationSettingsDto } from '../../workflow/dto/AddStageNotificationSettingsDto';
import { AddEntityVisibilitySettingDto } from '../../entityVisibilitySetting/dto';

export class EditOpportunityDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  tags: [];

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  mentions: MentionDto[];

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  opportunityType: number;

  @IsOptional()
  @ApiModelProperty()
  community;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  user: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  draft: boolean;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  attachments: [];

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  anonymous: number;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  viewCount: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  stage: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  workflow: number;

  @ValidateNested()
  @Type(() => AddEntityExperienceSettingDto)
  @IsOptional()
  entityExperienceSetting: AddEntityExperienceSettingDto;

  @ValidateNested()
  @Type(() => AddEntityVisibilitySettingDto)
  @IsOptional()
  entityVisibilitySetting: AddEntityVisibilitySettingDto;

  @ValidateNested()
  @Type(() => AddStageAssigneeSettingsDto)
  @IsOptional()
  assigneeSettings: AddStageAssigneeSettingsDto;

  @ValidateNested()
  @Type(() => AddStageAssigneeSettingsDto)
  @IsOptional()
  stageActivityVisibilitySettings: AddStageAssigneeSettingsDto;

  @ValidateNested()
  @Type(() => AddStageAssignmentSettingsDto)
  @IsOptional()
  stageAssignmentSettings: AddStageAssignmentSettingsDto;

  @ValidateNested()
  @Type(() => AddStageNotificationSettingsDto)
  @IsOptional()
  stageNotificationSettings: AddStageNotificationSettingsDto;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  opportunityTypeFieldsData: [];

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  stopNotifications: boolean;

  @IsDateString()
  @IsOptional()
  createdAt: Date;
}
