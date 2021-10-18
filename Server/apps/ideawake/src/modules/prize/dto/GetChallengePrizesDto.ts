'use strict';

import { IsOptional, IsInt, IsBooleanString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetChallengePrizesDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  category: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  community: number;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
