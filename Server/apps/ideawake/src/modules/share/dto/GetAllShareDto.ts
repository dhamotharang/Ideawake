'use strict';

import {
  // IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetAllShares {
  // @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  community;
}
