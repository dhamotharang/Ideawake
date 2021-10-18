'use strict';

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddStageAssigneeSettingsDto } from './AddStageAssigneeSettingsDto';
import { AddStageAssignmentSettingsDto } from './AddStageAssignmentSettingsDto';
import { AddStageNotificationSettingsDto } from './AddStageNotificationSettingsDto';

export class AddStageDto {
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
  orderNumber: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  status: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  workflow: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  actionItem: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

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
  attachedCustomFields: [];

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  attachedEvaluationCriteria: [];

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  oldPlatformId: string;
}
