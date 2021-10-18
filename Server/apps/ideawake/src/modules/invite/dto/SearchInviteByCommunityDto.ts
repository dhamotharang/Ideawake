'use strict';

import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

export class SearchInviteByCommunityDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly communityId;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly limit;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly offset;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly sortBy;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly exportData;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly sortType;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly searchByEmail;
}
