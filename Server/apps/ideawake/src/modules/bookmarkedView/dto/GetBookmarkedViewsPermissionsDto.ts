'use strict';

import { IsArray, IsInt, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetBookmarkedViewsPermissionsDto {
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  bookmarkedViewIds: number[];
}
