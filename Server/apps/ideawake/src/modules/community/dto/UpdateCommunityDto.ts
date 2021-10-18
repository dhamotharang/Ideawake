'use strict';

import { IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import {
  CommunityVisibility,
  CommunitySSOLoginEnum,
  LanguageAbbreviations,
} from '../../../enum';

export class UpdateCommunityDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  description: string;

  @IsEnum(CommunityVisibility)
  @IsOptional()
  @ApiModelProperty()
  visibility: CommunityVisibility;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isOpen: boolean;

  @IsEnum(CommunitySSOLoginEnum)
  @IsOptional()
  @ApiModelProperty()
  loginWithSSO: CommunitySSOLoginEnum;

  @IsEnum(LanguageAbbreviations)
  @IsOptional()
  @ApiModelProperty()
  defaultLanguage: LanguageAbbreviations;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isTranslation: boolean;
}
