'use strict';

import { IsUrl, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class CommunityDuplicateSearchDto {
  @IsUrl()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly url: string;
}
