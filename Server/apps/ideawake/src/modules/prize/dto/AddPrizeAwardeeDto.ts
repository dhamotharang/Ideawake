'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddAwardeeDto } from './AddAwardeeDto';

export class AddPrizeAwardeeDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  prizeId: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  message: string;

  @IsArray()
  @IsNotEmpty()
  awardees: AddAwardeeDto[];
}
