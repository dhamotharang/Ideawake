'use strict';

import { NotImplementedException } from '@nestjs/common';

export class InvitePendingException extends NotImplementedException {
  constructor(error?: string) {
    super('error.invite_pending', error);
  }
}
