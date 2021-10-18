'use strict';

import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetCommunityActionPointDto {
  @Transform(value => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly community;
}
