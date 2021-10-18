'use strict';

import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class GetCommunityUsersDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  excludedCircleId: number;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  take: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  skip: number;
}
