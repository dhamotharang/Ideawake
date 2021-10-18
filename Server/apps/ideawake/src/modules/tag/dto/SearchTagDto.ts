'use strict';

import { IsString, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SearchTagDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly name: string;
}
