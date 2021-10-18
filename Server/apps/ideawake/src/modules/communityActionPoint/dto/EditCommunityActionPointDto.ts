'use strict';

import { IsNotEmpty, IsArray } from 'class-validator';
import { EditCommunityActionPointDataDto } from './EditCommunityActionPointDataDto';

export class EditCommunityActionPointDto {
  @IsArray()
  @IsNotEmpty()
  data: EditCommunityActionPointDataDto[];
}
