'use strict';

import { IsInt, IsNotEmpty, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetBulkOppTypeExpSettingsDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityTypes: number[];

  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
