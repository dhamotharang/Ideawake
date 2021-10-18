'use strict';

import { IsInt } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EditUserRole {
  @Type(() => Number)
  @IsInt()
  @ApiModelProperty()
  readonly userId;

  @Type(() => Number)
  @IsInt()
  @ApiModelProperty()
  readonly role;

  @Type(() => Number)
  @IsInt()
  @ApiModelProperty()
  readonly community;
}
