'use strict';

import { IsArray, IsInt, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetCurrStageAssigneeForListDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityIds: number[];
}
