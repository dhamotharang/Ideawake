'use strict';

import {
  IsInt,
  IsNotEmpty,
  IsBooleanString,
  IsOptional,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetCommunityWorkflowsWithCountsDto {
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
  forFilter: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  challenge: number;
}
