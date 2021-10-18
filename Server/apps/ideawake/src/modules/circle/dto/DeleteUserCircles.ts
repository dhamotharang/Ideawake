'use strict';

import {
  IsNotEmpty,
  IsArray,
  //IsString
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class DeleteUserCircles {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly circleIds;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly user;
}
