'use strict';

import { IsNotEmpty, IsArray, IsInt } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetPostOpportunityPermissionsDto {
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  challenges: number[];
}
