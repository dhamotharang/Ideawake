'use strict';

import {
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  IsString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddStageNotificationSettingsDto {
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  groups: number[];

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  individuals: number[];

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunityOwners: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunityTeams: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunitySubmitters: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  followers: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  voters: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  message: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  sendEmail: boolean;
}
