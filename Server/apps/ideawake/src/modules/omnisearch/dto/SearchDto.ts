'use strict';

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  query: string;
}
