'use strict';

import { IsNotEmpty, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AnnouncementTargetingDto } from './AnnouncementTargetingDto';

export class GetPotentialTargetsCountDto {
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId?: number;

  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityType?: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AnnouncementTargetingDto)
  @ApiModelProperty()
  targeting: AnnouncementTargetingDto;
}
