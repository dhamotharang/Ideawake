'use strict';

import { IsNotEmpty, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddUsersInCircleDto {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly users;
}
