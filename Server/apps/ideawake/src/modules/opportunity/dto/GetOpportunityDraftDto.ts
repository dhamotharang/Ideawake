'use strict';

import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetOpportunityDraftDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiModelProperty()
  take: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiModelProperty()
  skip: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  opportunityTypeId: number;
}
