'use strict';

import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddEmailTemplateDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly name;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly subject;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly body;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly description;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly senderName;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly senderEmail;
}
