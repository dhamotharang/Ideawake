'use strict';

import { IsInt, IsNotEmpty, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetBulkDataDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsNotEmpty()
  @IsArray()
  entityData: { entityObjectId: number; entityType: number }[];
}
