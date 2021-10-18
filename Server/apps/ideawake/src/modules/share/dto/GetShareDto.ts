'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetShare {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  entityObjectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  type: string;
}

export class GetShareQuery {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  community: string;
}
