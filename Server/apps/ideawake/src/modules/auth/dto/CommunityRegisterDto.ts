'use strict';

import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { CommunitySSOLoginEnum, LanguageAbbreviations } from '../../../enum';

export class CommunityRegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly name;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly description;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly visibility;

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly isOpen;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly url;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly lastLogin;

  @IsEnum(CommunitySSOLoginEnum)
  @IsOptional()
  @ApiModelProperty()
  loginWithSSO: CommunitySSOLoginEnum;

  @IsEnum(LanguageAbbreviations)
  @IsOptional()
  @ApiModelProperty()
  defaultLanguage: LanguageAbbreviations;
}
