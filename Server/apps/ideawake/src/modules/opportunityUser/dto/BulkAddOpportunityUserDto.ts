'use strict';

import { IsInt, IsArray } from 'class-validator';

export class BulkAddOpportunityUserDto {
  @IsArray()
  @IsInt({ each: true })
  opportunityIds: [];

  @IsArray()
  users: [];
}
