'use strict';

import { IsString, IsOptional } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @IsString()
  @ApiModelProperty()
  readonly client_id: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  client_secret: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  grant_type: string;

  @IsString()
  @ApiModelProperty()
  redirect_uri: string;
}
