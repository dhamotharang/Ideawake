'use strict';

import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  refreshToken: string;

  @IsString()
  @Matches(/refresh_token/)
  @IsNotEmpty()
  @ApiModelProperty()
  grantType: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  scope: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly clientId: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  readonly clientSecret: string;
}
