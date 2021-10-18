'use strict';

import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class GetEntityTypesDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  abbreviation: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  entityCode: string;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
