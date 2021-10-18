'use strict';

import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class EditCommuityRole {
  @IsString()
  @ApiModelProperty()
  readonly userId;

  @IsString()
  @ApiModelProperty()
  readonly role;

  // @IsNumber()
  @ApiModelProperty()
  readonly communityId;
}
