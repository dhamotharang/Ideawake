'use strict';

import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class SearchChallengeDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchText: string;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
