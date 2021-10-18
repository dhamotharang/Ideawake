'use strict';

import {
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetBulkOpportunityPermissionsDto {
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  opportunities: number[];

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  computeExpSettings: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  computeVisibilitySettings: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  computeStageTabPermissions: boolean;
}
