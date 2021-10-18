'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LanguageAbbreviations } from '../../../enum';

export class UserAcceptInviteDto {
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

  @Type(() => Number)
  @IsInt()
  @IsOptional()
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

  @IsEnum(LanguageAbbreviations)
  @IsOptional()
  @ApiModelProperty()
  language: LanguageAbbreviations;

  @IsOptional()
  communities;

  @IsOptional()
  isDeleted;
}
