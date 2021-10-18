'use strict';

import { IsInt, IsArray, IsObject } from 'class-validator';

export class BulkAddCustomFieldDto {
  @IsArray()
  @IsInt({ each: true })
  opportunityIds: [];

  @IsObject()
  field: {};
}
