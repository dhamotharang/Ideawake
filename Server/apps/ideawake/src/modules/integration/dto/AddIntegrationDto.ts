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
import { AuthorizedWith } from '../../../enum/authorized-with.enum';

export class AddIntegrationDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  appName: string;

  @IsEnum(AuthorizedWith)
  @IsOptional()
  @ApiModelProperty()
  authorizeWith: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
