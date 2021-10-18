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

export class EditAuthIntegrationDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  authProvider: string;

  @IsEnum(AuthTypeEnum)
  @IsOptional()
  @ApiModelProperty()
  authType: AuthTypeEnum;

  @IsString()
  @IsOptional()
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
