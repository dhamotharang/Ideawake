'use strict';

import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class MultipleUserDto {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  userIds;
}
