'use strict';

import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumberString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ToBoolean } from '../../../decorators/transforms.decorator';

export class SearchExportUserByCommunityDto {
  @IsNumberString()
  @IsOptional()
  @ApiModelProperty()
  take?: string;

  @IsNumberString()
  @IsOptional()
  @ApiModelProperty()
  skip?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  sortBy?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  sortType?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchByName?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchByUsername?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchByEmail?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  searchText?: string;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  showArchived?: boolean;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  exportData?: boolean;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty()
  isUserPending?: boolean;
}
