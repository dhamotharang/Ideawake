'use strict';

import { IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VisibilityExpFieldIntegrationEnum } from '../../../enum/visibility-exp-field-integration.enum';

export class GetCustomFieldIntegrationsDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  entityType: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsEnum(VisibilityExpFieldIntegrationEnum)
  @IsOptional()
  @ApiModelProperty()
  visibilityExperience: VisibilityExpFieldIntegrationEnum;
}
