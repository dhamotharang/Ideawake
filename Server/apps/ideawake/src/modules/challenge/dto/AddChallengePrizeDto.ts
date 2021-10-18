'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddChallengePrizeDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  image: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  totalWinners: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  prizeValue: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isRedeemable: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  redeemPoints: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  category: number;
}
