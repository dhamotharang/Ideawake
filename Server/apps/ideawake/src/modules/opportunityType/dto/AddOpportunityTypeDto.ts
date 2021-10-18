'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddOpportunityTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  color: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  abbreviation: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isEnabled: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsNotEmpty()
  @ApiModelProperty()
  community;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  postingExperience: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  workflow: number;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  enableDupDetection: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  duplicatableTypes: [];

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  enableLinking: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  linkableTypes: [];

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  titlePlaceholder: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  descPlaceholder: string;
}
