'use strict';

import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAnnouncementsFeedDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiModelProperty()
  entityType: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiModelProperty()
  take: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiModelProperty()
  skip: number;
}
