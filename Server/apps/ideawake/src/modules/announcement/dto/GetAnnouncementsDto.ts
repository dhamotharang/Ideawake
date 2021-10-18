'use strict';

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ToBoolean } from '../../../decorators/transforms.decorator';
import { AnnouncementStatuses } from '../../../enum';

export class GetAnnouncementsDto {
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiModelProperty()
  entityType: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiModelProperty()
  take: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiModelProperty()
  skip: number;

  @IsEnum(AnnouncementStatuses)
  @IsOptional()
  @ApiModelProperty()
  status: string;
}
