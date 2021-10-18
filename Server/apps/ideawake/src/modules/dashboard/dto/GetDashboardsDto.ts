import { IsOptional, IsBooleanString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class GetDashboardsDto {
  @IsBooleanString()
  @IsOptional()
  @ApiModelProperty()
  isDeleted: boolean;
}
