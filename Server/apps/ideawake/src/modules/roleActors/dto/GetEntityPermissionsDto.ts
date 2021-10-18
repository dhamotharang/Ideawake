'use strict';

import { IsNotEmpty, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RoleActorTypes } from '../../../enum';

export class GetEntityPermissionsDto {
  @IsEnum(RoleActorTypes)
  @IsOptional()
  @ApiModelProperty()
  actorType: RoleActorTypes;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  actorId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityType: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
