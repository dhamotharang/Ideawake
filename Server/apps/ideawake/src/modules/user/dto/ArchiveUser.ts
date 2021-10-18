'use strict';

import { IsNotEmpty, IsArray, IsBoolean, IsInt } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class ArchiveUserDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  @ApiModelProperty()
  users: [];

  @IsBoolean()
  @IsNotEmpty()
  @ApiModelProperty()
  isDeleted: boolean;
}
