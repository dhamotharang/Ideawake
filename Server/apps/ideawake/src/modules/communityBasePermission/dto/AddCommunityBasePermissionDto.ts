'use strict';

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddCommunityBasePermissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  community: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  communitySetting: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  role: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted;
}
