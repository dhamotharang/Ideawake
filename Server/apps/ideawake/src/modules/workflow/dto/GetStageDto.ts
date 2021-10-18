'use strict';

import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetStageSettingsDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  entityType: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  entityObjectId: number;
}
