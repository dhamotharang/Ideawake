'use strict';

import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsIn,
  IsObject,
  IsDefined,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class ExportOpportunitiesDto {
  // Export settings.

  // TODO: Add in 'xlsx' support.
  @IsString()
  @IsIn(['csv'])
  @IsNotEmpty()
  @ApiModelProperty()
  exportFormat: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  anonymizedExport: boolean;

  // Opportunities filters.

  // TODO: Add nested DTO for opportunityFilters.

  @IsObject()
  @IsDefined()
  @ApiModelProperty()
  opportunityFilters: {};
}
