'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsInt,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Index } from 'typeorm';

export class HooksSubscriptionDto {
  @Index()
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  hookUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  event: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  source: string;

  @IsObject()
  @ApiModelProperty()
  inputData: {};

  @IsInt()
  @ApiModelProperty()
  hookId: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
