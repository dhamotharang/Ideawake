'use strict';

import { IsNotEmpty, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddStageNotificationSettingsDto } from '../../workflow/dto/AddStageNotificationSettingsDto';

export class GetStageNotifiableUsersCountDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunity: number;

  @ValidateNested()
  @Type(() => AddStageNotificationSettingsDto)
  @IsOptional()
  notificationSettings: AddStageNotificationSettingsDto;
}
