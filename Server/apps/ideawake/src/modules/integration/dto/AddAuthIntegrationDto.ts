'use strict';

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AuthTypeEnum } from '../../../enum';

export class AddAuthIntegrationDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  authProvider: string;

  @IsEnum(AuthTypeEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  authType: AuthTypeEnum;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  loginUrl: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  clientId: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
