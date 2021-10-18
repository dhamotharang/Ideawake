'use strict';

import {
  IsInt,
  IsNotEmpty,
  IsBooleanString,
  IsOptional,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetCommunityStatusDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  withCounts: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  challenge: number;
}
