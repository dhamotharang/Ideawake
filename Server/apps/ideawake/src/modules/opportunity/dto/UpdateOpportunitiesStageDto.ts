'use strict';

import { IsArray, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddStageAssigneeSettingsDto } from '../../workflow/dto/AddStageAssigneeSettingsDto';
import { AddStageAssignmentSettingsDto } from '../../workflow/dto/AddStageAssignmentSettingsDto';
import { AddStageNotificationSettingsDto } from '../../workflow/dto/AddStageNotificationSettingsDto';

export class UpdateOpportunitiesStageDto {
  @IsArray()
  @ApiModelProperty()
  ids: [];

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
}
