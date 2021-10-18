import { IsOptional, IsString, IsInt, IsObject, IsEnum } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WidgetTypeEnum } from '../../../enum/widget-type.enum';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty()
  title: string;

  @IsObject()
  @IsOptional()
  @ApiModelProperty()
  configData: {};

  @IsEnum(WidgetTypeEnum)
  @IsOptional()
  @ApiModelProperty()
  widgetType: WidgetTypeEnum;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiModelProperty()
  entityType: number;
}
