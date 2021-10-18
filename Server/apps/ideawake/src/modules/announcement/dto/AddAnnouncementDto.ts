'use strict';

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AnnouncementTargetingDto } from './AnnouncementTargetingDto';
import { AnnouncementStatuses } from '../../../enum';
import { AnnouncementExpSettingDto } from './AnnouncementExpSettingDto';

export class AddAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  message: string;

  @IsOptional()
  @ApiModelProperty({
    enum: AnnouncementStatuses,
    default: AnnouncementStatuses.SCHEDULED,
  })
  @IsEnum(AnnouncementStatuses)
  status: AnnouncementStatuses;

  @IsDateString()
  @IsOptional()
  @ApiModelProperty()
  scheduledAt: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  sendEmail: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  sendFeed: boolean;

  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityObjectId: number;

  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityType: number;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  attachments: {}[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AnnouncementTargetingDto)
  @ApiModelProperty()
  targeting: AnnouncementTargetingDto;

  @ValidateNested()
  @Type(() => AnnouncementExpSettingDto)
  @IsNotEmpty()
  @ApiModelProperty()
  experienceSetting: AnnouncementExpSettingDto;
}
