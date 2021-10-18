'use strict';

import { UnauthorizedException } from '@nestjs/common';

export class InvalidPasswordException extends UnauthorizedException {
  constructor(error?: string) {
    super('error.invalid_password', error);
  }
}
