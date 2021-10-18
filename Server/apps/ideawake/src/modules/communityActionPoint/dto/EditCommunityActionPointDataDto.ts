'use strict';

import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';

export class EditCommunityActionPointDataDto {
  @Transform(value => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly id;

  @Transform(value => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly experiencePoint;
}
