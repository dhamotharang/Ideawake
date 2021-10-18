'use strict';

import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsIn,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SearchCommunityCirclesDto {
  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  take?: number;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  skip?: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  sortBy?: string;

  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  @ApiModelProperty()
  sortType?: 'ASC' | 'DESC';

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchText?: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  excludedIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  extraCircleIds?: number[];
}
