'use strict';

import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StageEmailReminderEnum } from '../../../enum/stage-email-reminder.enum';

export class AddStageAssignmentSettingsDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  instructions: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  stageTimeLimit: number;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  emailNotification: boolean;

  @IsEnum(StageEmailReminderEnum)
  @IsOptional()
  @ApiModelProperty()
  emailReminder: StageEmailReminderEnum;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  stageComments: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allAssigneesCompleted: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  minimumResponses: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  completionTimeLimit: number;
}
