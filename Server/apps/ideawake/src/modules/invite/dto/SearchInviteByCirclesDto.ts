'use strict';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SearchInvitesByCircleDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly circleId;

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
