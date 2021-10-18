'use strict';

import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InviteUsersDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly name;

  @IsString()
  @IsEmail()
  @ApiModelProperty()
  email;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly senderName;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly isSSO;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly isOpened;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly isEmailLinkClicked;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly statusCode;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly role;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly inviteCode;

  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly emailOpenedCount;
}
export class SendInviteDto {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  inviteUsers: InviteUsersDto[];

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  isSSO: boolean;
}
