'use strict';

import { IsNotEmpty, IsInt, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetOpposEvalSummaryDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  entityTypeId: number;

  @Type(() => Number)
  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityIds: number[];
}
