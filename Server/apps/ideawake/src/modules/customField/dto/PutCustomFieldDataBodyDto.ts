'use strict';

import { IsNotEmpty, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class PutCustomFieldDataBodyDto {
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  data: [];
}
