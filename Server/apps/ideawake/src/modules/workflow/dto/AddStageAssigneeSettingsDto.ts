'use strict';

import {
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CustomFieldAssigneeDto } from './CustomFieldAssigneeDto';

export class AddStageAssigneeSettingsDto {
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  unassigned: boolean;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  groups: number[];

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  individuals: number[];

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  communityAdmins: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  communityModerators: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  communityUsers: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunityOwners: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunityTeams: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  opportunitySubmitters: boolean;

  @ValidateNested()
  @Type(() => CustomFieldAssigneeDto)
  @IsOptional()
  @ApiModelProperty()
  customFieldAssignee: CustomFieldAssigneeDto;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  allMembers: boolean;
}
