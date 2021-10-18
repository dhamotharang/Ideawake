'use strict';

import { IsOptional, IsBooleanString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetMyCommunitiesDto {
  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isManageable: boolean;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: string;
}
