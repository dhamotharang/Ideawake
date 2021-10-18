'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetUserFollowersDto {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly userId: string;

  // @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly communityId;
}
