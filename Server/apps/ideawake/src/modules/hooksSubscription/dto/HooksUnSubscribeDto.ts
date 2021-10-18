'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class HooksUnSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  hookUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  event: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  source: string;
}
