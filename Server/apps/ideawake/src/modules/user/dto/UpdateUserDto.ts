'use strict';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { LanguageAbbreviations } from '../../../enum';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  company: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  country: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  position: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  profileBio: string;

  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  profileImage: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiModelProperty()
  skills: number[];

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  zipCode: string;

  @IsEnum(LanguageAbbreviations)
  @IsOptional()
  @ApiModelProperty()
  language: LanguageAbbreviations;
}
