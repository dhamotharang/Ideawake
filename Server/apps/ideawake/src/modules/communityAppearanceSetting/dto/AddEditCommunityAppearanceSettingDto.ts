'use strict';

import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AddEditCommunityAppearanceSettingDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  defaultLogo: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  mobileLogo: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  favicon: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  emailFeaturedImage: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  primaryColor: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  accentColor: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  navigationBackgroundColor: string;
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  navigationTextColor: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  footerBackgroundColor: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  footerTextColor: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  jumbotronBackgroundImage: string;

  @IsString() @IsOptional() @ApiModelProperty() jumbotronPageTitle: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  jumbotronPageDescription: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
