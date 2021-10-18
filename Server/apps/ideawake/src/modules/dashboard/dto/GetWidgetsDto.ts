import {
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsBooleanString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetWidgetsDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @ApiModelProperty()
  dashboard: number;

  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
