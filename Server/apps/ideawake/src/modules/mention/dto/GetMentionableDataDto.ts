'use strict';

import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetMentionableDataDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  opportunity: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
