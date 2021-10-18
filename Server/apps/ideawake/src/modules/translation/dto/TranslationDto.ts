'use strict';

import { IsNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class TranslationDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  q: Array<string>;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  target: string;
}
