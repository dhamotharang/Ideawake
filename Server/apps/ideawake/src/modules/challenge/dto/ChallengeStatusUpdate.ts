'use strict';

import {
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  IsEnum,
  IsString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddEntityExperienceSettingDto } from '../../entityExperienceSetting/dto/AddEntityExperienceSettingDto';
import { AddEntityVisibilitySettingDto } from '../../entityVisibilitySetting/dto';
import { ChallengeStatuses } from '../../../enum/cahllenge-status.enum';

export class ChallengeStatusUpdate {
  @IsEnum(ChallengeStatuses)
  @IsNotEmpty()
  @ApiModelProperty()
  status: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  alertMessage: string;

  @ValidateNested()
  @Type(() => AddEntityExperienceSettingDto)
  @IsOptional()
  entityExperienceSetting: AddEntityExperienceSettingDto;

  @ValidateNested()
  @Type(() => AddEntityVisibilitySettingDto)
  @IsOptional()
  submissionVisibilitySetting: AddEntityVisibilitySettingDto;
}
