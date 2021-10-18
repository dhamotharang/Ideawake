'use strict';

import { IsEnum, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { PageTypeEnum } from '../../../enum/page-type.enum';
import { Type } from 'class-transformer';

export class GetColumnOptionsDto {
  @IsEnum(PageTypeEnum)
  @IsOptional()
  @ApiModelProperty()
  pageType: PageTypeEnum;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;
}
