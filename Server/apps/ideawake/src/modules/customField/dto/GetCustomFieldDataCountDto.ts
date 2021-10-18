'use strict';

import { IsInt, IsArray } from 'class-validator';

export class GetCustomFieldDataCountDto {
  @IsArray()
  @IsInt({ each: true })
  opportunityIds: [];

  @IsInt()
  fieldId: number;
}
