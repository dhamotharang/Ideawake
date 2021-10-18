'use strict';

import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddOpportunityFieldDataDto {
  @IsObject()
  @IsNotEmpty()
  @ApiModelProperty()
  fieldData;
}
