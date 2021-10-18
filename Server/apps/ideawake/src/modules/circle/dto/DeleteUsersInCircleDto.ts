'use strict';

import {
  IsNotEmpty,
  IsArray,
  // IsString
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteUsersInCircleDto {
  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly circleId;

  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly users;
}
