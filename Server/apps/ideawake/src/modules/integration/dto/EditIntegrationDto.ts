'use strict';

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { AuthorizedWith } from '../../../enum/authorized-with.enum';

export class EditIntegrationDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  appName: string;

  @IsEnum(AuthorizedWith)
  @IsOptional()
  @ApiModelProperty()
  authorizeWith: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  redirectUrl: string;
}
