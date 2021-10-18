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
  @IsOptional()
  @ApiModelProperty()
  userName;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  role;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  email;

  @IsString()
  @IsOptional()
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

  //TODO: Remove the following oldPassword & salt.

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  oldPassword;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  salt;
}
