'use strict';

import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsBooleanString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RoleLevelEnum } from '../../../enum/role-level.enum';

export class GetRoleDto {
  @IsEnum(RoleLevelEnum)
  @IsOptional()
  @ApiModelProperty()
  level: RoleLevelEnum;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  manageableRoles: boolean;
}
