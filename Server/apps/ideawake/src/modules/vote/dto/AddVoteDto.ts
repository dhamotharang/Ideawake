'use strict';

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddVoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly voteType: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  updatedBy: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  createdBy: string;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  entityType;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  user: string;

  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
