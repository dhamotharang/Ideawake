'use strict';

import {
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsOptional,
  // IsString,
  // IsNumber,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddCircleDto {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly groups;

  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly communityId;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  readonly pinToShortcut;
}
