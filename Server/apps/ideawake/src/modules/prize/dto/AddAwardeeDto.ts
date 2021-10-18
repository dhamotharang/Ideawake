'use strict';

import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AddAwardeeDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  candidateId: number;

  @IsString()
  @IsNotEmpty()
  type: string;
}
