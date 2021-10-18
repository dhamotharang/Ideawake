'use strict';

import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class TestEmailTemplateDto {
  @IsString()
  @ApiModelProperty()
  body: string;

  @IsString()
  @ApiModelProperty()
  subject: string;

  @IsString()
  @ApiModelProperty()
  featureImage: string;

  @IsString()
  @ApiModelProperty()
  footerSection: string;
}
