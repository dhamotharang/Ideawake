'use strict';

import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetBookmarkedViewsDto {
  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchText: string;
}
