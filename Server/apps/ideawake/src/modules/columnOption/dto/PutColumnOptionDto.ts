'use strict';

import { IsNotEmpty, IsEnum, IsInt, IsArray } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { PageTypeEnum } from '../../../enum/page-type.enum';
import { Type } from 'class-transformer';

export class PutColumnOptionDto {
  @IsEnum(PageTypeEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  pageType: PageTypeEnum;

  @IsArray()
  @IsNotEmpty()
  @ApiModelProperty()
  optionsData: [];

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
