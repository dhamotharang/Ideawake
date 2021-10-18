'use strict';

import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class GetOpportunitiesCountDto {
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challengeId: number;
}
