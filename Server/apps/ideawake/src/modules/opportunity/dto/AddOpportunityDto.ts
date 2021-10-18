'use strict';

import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddEntityExperienceSettingDto } from '../../entityExperienceSetting/dto/AddEntityExperienceSettingDto';
import { MentionDto } from '../../mention/dto/MentionDto';

export class AddOpportunityDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  tags: [];

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  mentions: MentionDto[];

  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityType: number;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  community;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  user: string;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  attachments: [];

  @IsNumber()
  @IsOptional()
  @ApiModelProperty()
  anonymous: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  challenge: number;

  @ValidateNested()
  @Type(() => AddEntityExperienceSettingDto)
  @IsOptional()
  entityExperienceSetting: AddEntityExperienceSettingDto;

  @IsArray()
  @IsOptional()
  @ApiModelProperty()
  opportunityTypeFieldsData: [];
}
