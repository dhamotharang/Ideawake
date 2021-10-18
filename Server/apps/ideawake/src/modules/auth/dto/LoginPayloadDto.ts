'use strict';

import { TokenPayloadDto } from '../../../modules/auth/dto/TokenPayloadDto';
import { ApiModelProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../modules/user/user.entity';

export class LoginPayloadDto {
  @ApiModelProperty({ type: UserEntity })
  user: UserEntity;
  @ApiModelProperty({ type: TokenPayloadDto })
  token: TokenPayloadDto;
}
