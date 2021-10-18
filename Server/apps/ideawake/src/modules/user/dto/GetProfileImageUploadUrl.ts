'use strict';

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetProfileImageUploadUrl {
  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  contentType: string;
}
