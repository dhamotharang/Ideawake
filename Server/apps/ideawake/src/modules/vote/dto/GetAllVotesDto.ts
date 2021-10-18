'use strict';

import {
  // IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetAllVotes {
  // @IsString()
  @IsOptional()
  @ApiModelProperty()
  user;

  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
