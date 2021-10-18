'use strict';

import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddShortcutDto {
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

  @IsString()
  @ApiModelProperty()
  entityObjectId: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiModelProperty()
  email: string;

  @IsString()
  @ApiModelProperty()
  entityType: string | {};

  @IsString()
  @ApiModelProperty()
  community: string | {};
}
