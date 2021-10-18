'use strict';

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCustomFieldDto {
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
  placeholderText: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  uniqueId: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  customFieldType: number;

  @IsObject()
  @IsOptional()
  @ApiModelProperty()
  fieldDataObject: {};

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  isRequired: boolean;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  editRoles: number[];

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  editRolesText: string;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  visibilityRoles: number[];

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  visibilityRolesText: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  oldPlatformId: string;
}
