'use strict';
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserGroupDto {
  @Transform(value => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiModelProperty()
  readonly community;
}
