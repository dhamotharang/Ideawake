'use strict';

import { NotFoundException } from '@nestjs/common';

export class CommunityNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.community_not_found', error);
  }
}
