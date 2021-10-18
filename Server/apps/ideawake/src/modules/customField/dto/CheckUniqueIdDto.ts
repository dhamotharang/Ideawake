'use strict';

import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckUniqueIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  uniqueId: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  ignoreId: number;
}
