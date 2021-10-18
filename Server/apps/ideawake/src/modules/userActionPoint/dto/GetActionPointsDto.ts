'use strict';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetUserActionPointDto {
  @Transform(value => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly community;

  //   @IsString()
  //   @IsOptional()
  //   @ApiModelProperty()
  //   fromDate: string;

  //   @IsString()
  //   @IsOptional()
  //   @ApiModelProperty()
  //   toDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiModelProperty()
  frequency: string;
}
