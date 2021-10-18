'use strict';

import {
  IsOptional,
  IsString,
  IsNotEmpty, //IsNumber
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SearchCircleDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly limit;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly offset;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly sortBy;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly sortType;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly searchByName;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly showArchived;

  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly communityId;
}
