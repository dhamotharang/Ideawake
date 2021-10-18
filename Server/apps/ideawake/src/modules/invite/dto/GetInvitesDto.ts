'use strict';

import { IsInt, IsOptional, IsBooleanString, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetInvitesDto {
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

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  inviteAccepted: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchText: string;
}
