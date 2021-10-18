'use strict';

import { IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class IncreaseViewCountOpportunityDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  viewCount;
}
