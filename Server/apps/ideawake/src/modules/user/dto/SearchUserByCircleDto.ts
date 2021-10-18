'use strict';

import { IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class SearchUserByCircleDto {
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
  readonly sortType;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly searchByName;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly searchByUsername;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly searchByEmail;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly showArchived;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly exportData;

  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly communityId;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly circleId;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isUserPending: boolean;
}
