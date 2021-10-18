'use strict';

import { IsOptional, IsBoolean } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AnnouncementExpSettingDto {
  @IsBoolean()
  @IsOptional()
  @ApiModelProperty({ default: true })
  allowVoting: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiModelProperty({ default: true })
  allowCommenting: boolean;
}
