import {
  IsOptional,
  IsString,
  IsInt,
  IsObject,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WidgetTypeEnum } from '../../../enum/widget-type.enum';

export class AddWidgetDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  @ApiModelProperty()
  configData: {};

  @IsEnum(WidgetTypeEnum)
  @IsNotEmpty()
  @ApiModelProperty()
  widgetType: WidgetTypeEnum;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  community: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  dashboard: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  entityType: number;
}
