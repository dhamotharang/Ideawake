'use strict';

import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  CommunityVisibility,
  CommunitySSOLoginEnum,
  LanguageAbbreviations,
} from '../../../enum';

export class AddCommunityDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  description: string;

  @IsEnum(CommunityVisibility)
  @IsNotEmpty()
  @ApiModelProperty()
  visibility: CommunityVisibility;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  isOpen: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  url: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  lastLogin: string;

  @IsEnum(CommunitySSOLoginEnum)
  @IsOptional()
  @ApiModelProperty()
  loginWithSSO: CommunitySSOLoginEnum;

  @IsEnum(LanguageAbbreviations)
  @IsOptional()
  @ApiModelProperty()
  defaultLanguage: LanguageAbbreviations;
}
