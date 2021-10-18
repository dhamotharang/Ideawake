'use strict';

import {
  IsNotEmpty,
  IsArray,
  // IsString,
  // IsNumber,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class ResetInviteDto {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly inviteIds: string[];

  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly communityId;
}
