'use strict';

import { IsOptional, IsBooleanString, IsEnum, IsInt } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ChallengeStatuses } from '../../../enum/cahllenge-status.enum';
import { Type } from 'class-transformer';

export class GetChallengeDto {
  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsEnum(ChallengeStatuses)
  @IsOptional()
  @ApiModelProperty()
  status: string;

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
