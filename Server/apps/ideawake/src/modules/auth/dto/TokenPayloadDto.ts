'use strict';

import { ApiModelProperty } from '@nestjs/swagger';

export class TokenPayloadDto {
  @ApiModelProperty()
  expiresIn: number;

  @ApiModelProperty()
  secret: string;

  @ApiModelProperty()
  token: string;

  @ApiModelProperty()
  fullToken: string;

  @ApiModelProperty()
  refreshToken: string;

  @ApiModelProperty()
  currentCommunityObj: {};

  constructor(data: {
    expiresIn?: number;
    secret?: string;
    token?: string;
    currentCommunityObj?: {};
    fullToken: string;
    refreshToken: string;
  }) {
    this.expiresIn = data.expiresIn;
    this.secret = data.secret;
    this.token = data.token;
    this.fullToken = data.fullToken;
    this.refreshToken = data.refreshToken;
    this.currentCommunityObj = data.currentCommunityObj;
  }
}
