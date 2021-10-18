'use strict';

import { IsNotEmpty, IsInt, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFieldDataPermissionsDto {
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  customFields: number[];

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  opportunity: number;
}
