'use strict';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddCommunitySettingDto {
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
  type: string;
}
