'use strict';

import { IsInt, IsBooleanString, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetWorkflowStageDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  workflow: number;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  withCounts: boolean;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  withSettings: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  challenge: number;
}
