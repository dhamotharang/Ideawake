'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsPositive,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddPrizeDto {
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
  @IsPositive()
  @IsOptional()
  @ApiModelProperty()
  totalWinners: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
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
  challenge: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  category: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
