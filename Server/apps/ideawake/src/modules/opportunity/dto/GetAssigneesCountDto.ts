'use strict';

import { IsNotEmpty, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddStageAssigneeSettingsDto } from '../../workflow/dto/AddStageAssigneeSettingsDto';

export class GetAssigneesCountDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunity: number;

  @ValidateNested()
  @Type(() => AddStageAssigneeSettingsDto)
  @IsOptional()
  assigneeSettings: AddStageAssigneeSettingsDto;
}
