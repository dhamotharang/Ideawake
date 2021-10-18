'use strict';

import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetVote {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  type: string;
}

export class GetVoteQuery {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: string;
}
