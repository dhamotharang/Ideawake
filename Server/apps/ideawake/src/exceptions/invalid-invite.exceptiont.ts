'use strict';

import { NotFoundException } from '@nestjs/common';

export class InvalidInviteException extends NotFoundException {
  constructor(error?: string) {
    super('error.invite_not_found', error);
  }
}
