'use strict';

import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddFollowingContentDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly displayName: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  url: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  updatedBy: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  createdBy: string;

  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId;

  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiModelProperty()
  email: string;

  @IsNotEmpty()
  @ApiModelProperty()
  entityType;

  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
