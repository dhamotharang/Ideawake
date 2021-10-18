'use strict';

import {
  IsNotEmpty,
  IsInt,
  IsBooleanString,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetCustomFieldsDto {
  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchText: string;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  customFieldTypes: number[];
}
