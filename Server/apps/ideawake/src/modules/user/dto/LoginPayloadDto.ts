import { UserEntity } from '../user.entity';
'use strict';

import { TokenPayloadDto } from '../../../modules/auth/dto/TokenPayloadDto';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginPayloadDto {
  @ApiModelProperty({ type: UserEntity })
  user: UserEntity;
  @ApiModelProperty({ type: TokenPayloadDto })
  token: TokenPayloadDto;
}
