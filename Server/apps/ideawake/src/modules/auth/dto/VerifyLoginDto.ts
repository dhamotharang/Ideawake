'use strict';

import { IsString, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class VerifyLoginDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  clientId: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  redirectUri: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  state: string;
}
