'use strict';

import {
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetUniqueUsersCountDto {
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  users: number[];

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  groups: number[];

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allCommunityMembers: boolean;
}
