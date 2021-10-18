'use strict';

import { IsNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class EditCircleDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly name;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly parentCircleId;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  readonly pinToShortcut;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly displayName;
}
