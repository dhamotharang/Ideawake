'use strict';

import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SamlLoginDto {
  @IsString()
  @ApiModelProperty()
  readonly SAMLResponse: string;

  @IsString()
  @ApiModelProperty()
  readonly RelayState: string;
}
