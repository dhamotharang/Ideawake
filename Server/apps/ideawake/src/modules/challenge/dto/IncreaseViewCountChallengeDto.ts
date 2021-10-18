'use strict';

import { IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class IncreaseViewCountChallengeDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  viewCount;
}
