'use strict';

import { IsInt, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomFieldAssigneeDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  fieldId: number;

  @IsArray()
  @IsNotEmpty()
  options: [];
}
