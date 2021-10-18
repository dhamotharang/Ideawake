'use strict';

import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export class GetActionItemLogsStatusCountsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  actionItemId: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  actionItemAbbreviation: string;
}
