'use strict';

import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddShareDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  message: string;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  entityType;

  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  sharedWith: string[];

  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
