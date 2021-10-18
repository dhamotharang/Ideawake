'use strict';

import { IsNotEmpty, IsString, IsIn, IsInt, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer/decorators';

export class ExportEvaluationDto {
  // Export settings.

  // TODO: Add in 'xlsx' support.
  @IsString()
  @IsIn(['csv'])
  @IsNotEmpty()
  @ApiModelProperty()
  exportFormat: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityTypeId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityId: number;
}
