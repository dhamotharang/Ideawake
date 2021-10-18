'use strict';

import { IsString, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UserDuplicateSearchDto {
  @IsString()
  @IsEmail()
  @ApiModelProperty()
  readonly email: string;
}
