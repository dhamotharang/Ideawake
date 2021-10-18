'use strict';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiModelProperty } from '@nestjs/swagger';

export class EditOpportunityTypeDto {
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

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  postingExperience: number;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  opportunityTypeFields: [];

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
