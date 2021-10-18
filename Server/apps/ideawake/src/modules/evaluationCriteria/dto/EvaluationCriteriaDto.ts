'use strict';

import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddEvaluationCriteriaDto {
  @Type(() => Number)
  @IsNotEmpty()
  @ApiModelProperty()
  evaluationType: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsObject()
  @IsNotEmpty()
  @ApiModelProperty()
  criteriaObject: string;

  // @Type(() => Number)
  @IsNotEmpty()
  @ApiModelProperty()
  criteriaWeight: number;

  @Type(() => Number)
  @IsNotEmpty()
  @ApiModelProperty()
  community;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  oldPlatformId: string;
}
export class SearchEvaluationCriteriaDto {
  @IsString()
  @IsOptional()
  title: string;

  @Type(() => Number)
  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
