'use strict';

import { IsNotEmpty, IsInt, IsString, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MentionObjectTypeEnum } from '../../../enum/mention-object-type.enum';

export class MentionDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  mentionedObjectId: number;

  @IsEnum(MentionObjectTypeEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  type: string;
}
