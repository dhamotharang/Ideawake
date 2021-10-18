'use strict';

import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  clientId: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  redirectUri: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  state: string;

  @IsString()
  @IsEmail()
  @ApiModelProperty()
  email: string;

  @IsString()
  @ApiModelProperty()
  readonly password: string;
}
