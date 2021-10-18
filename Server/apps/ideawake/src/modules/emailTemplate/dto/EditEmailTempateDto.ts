'use strict';

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class EditEmailTemplateDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  senderName: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  senderEmail: string;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  frequency: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  timeZone: string;

  @IsObject()
  @IsOptional()
  @ApiModelProperty()
  runAt: {};

  @IsString()
  @ApiModelProperty()
  body: string;

  @IsString()
  @ApiModelProperty()
  subject: string;

  @IsString()
  @ApiModelProperty()
  featureImage: string;

  @IsString()
  @ApiModelProperty()
  footerSection: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
