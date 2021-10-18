'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class TagCountByOpportunity {
  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly community;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly type: string;
}
