'use strict';

import { IsInt, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ActionItemLogStatusEnum } from '../../../enum';

export class GetActionItemLogsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  entityTypeName: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  actionItemId: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  actionItemAbbreviation: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  take: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  skip: number;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  orderBy: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  orderType: string;

  @IsEnum(ActionItemLogStatusEnum)
  @IsOptional()
  @ApiModelProperty()
  status: ActionItemLogStatusEnum;
}
