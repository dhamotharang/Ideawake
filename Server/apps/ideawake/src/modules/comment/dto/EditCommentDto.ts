'use strict';

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

import { ApiModelProperty } from '@nestjs/swagger';
import { MentionDto } from '../../mention/dto/MentionDto';

export class EditCommentDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly message;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  readonly isDeleted;

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
  attachments;

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  anonymous: number;
}
