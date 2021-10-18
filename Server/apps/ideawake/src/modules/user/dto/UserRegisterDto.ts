'use strict';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UserRegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly firstName;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly lastName;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  userName;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  role;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  email;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly password;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly lastLogin;

  @IsOptional()
  communities;

  @IsOptional()
  isDeleted;
}
