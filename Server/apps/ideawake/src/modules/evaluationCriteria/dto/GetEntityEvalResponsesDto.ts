'use strict';

import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetEntityEvalResponsesDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  entityType: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunity: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  take: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  skip: number;
}
