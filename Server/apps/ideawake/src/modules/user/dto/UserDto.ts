'use strict';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/AbstractDto';
import { UserRole } from './../../../enum/user-role.enum';

export class UserDto extends AbstractDto {
  @ApiModelPropertyOptional()
  firstName: string;

  @ApiModelPropertyOptional()
  lastName: string;

  @ApiModelPropertyOptional()
  username: string;

  @ApiModelPropertyOptional({ enum: UserRole })
  role: UserRole;

  @ApiModelPropertyOptional()
  email: string;
}
