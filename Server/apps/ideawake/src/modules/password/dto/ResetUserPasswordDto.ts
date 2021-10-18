'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class ResetUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  resetCode: string;
}
