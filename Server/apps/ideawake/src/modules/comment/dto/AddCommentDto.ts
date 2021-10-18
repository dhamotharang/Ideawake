'use strict';

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiModelProperty } from '@nestjs/swagger';
import { MentionDto } from '../../mention/dto/MentionDto';

export class AddCommentDto {
  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  readonly commentThread;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly message;

  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly community;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly entityType;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly entityObjectId;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  readonly tags;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  mentions: MentionDto[];

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  readonly attachments;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  anonymous: number;
}
