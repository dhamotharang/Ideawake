'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetCommunityFromUrlDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  url: string;
}
