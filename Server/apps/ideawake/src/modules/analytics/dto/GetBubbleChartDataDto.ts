'use strict';

import {
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BubbleColorTypeEnum, BubbleDataPointTypeEnum } from '../enum';

class ColorOptionsDto {
  @IsEnum(BubbleColorTypeEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  type: BubbleColorTypeEnum;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  id: number;
}

class DataPointOptionsDto {
  @IsEnum(BubbleDataPointTypeEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  type: BubbleDataPointTypeEnum;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  id: number;

  @IsObject()
  @IsOptional()
  @ApiModelProperty()
  options: {};
}

export class GetBubbleChartDataDto {
  @IsObject()
  @IsNotEmpty()
  @ApiModelProperty()
  opportunityFilter: {};

  @ValidateNested()
  @Type(() => ColorOptionsDto)
  @IsNotEmpty()
  @ApiModelProperty()
  bubbleColor: ColorOptionsDto;

  @ValidateNested()
  @Type(() => DataPointOptionsDto)
  @IsNotEmpty()
  @ApiModelProperty()
  radiusDataPoint: DataPointOptionsDto;

  @ValidateNested()
  @Type(() => DataPointOptionsDto)
  @IsNotEmpty()
  @ApiModelProperty()
  xAxisDataPoint: DataPointOptionsDto;

  @ValidateNested()
  @Type(() => DataPointOptionsDto)
  @IsNotEmpty()
  @ApiModelProperty()
  yAxisDataPoint: DataPointOptionsDto;
}
