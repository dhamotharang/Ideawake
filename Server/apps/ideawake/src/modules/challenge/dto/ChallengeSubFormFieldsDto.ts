'use strict';

import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { VisibilityExpFieldIntegrationEnum } from '../../../enum';

export class ChallengeSubFormFieldsDto {
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  field: number;

  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  order: number;

  @IsEnum(VisibilityExpFieldIntegrationEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  visibilityExperience: VisibilityExpFieldIntegrationEnum;
}
