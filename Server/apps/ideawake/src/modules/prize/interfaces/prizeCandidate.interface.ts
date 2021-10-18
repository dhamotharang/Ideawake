'use strict';

import { UserEntity } from '../../user/user.entity';
import { OpportunityEntity } from '../../opportunity/opportunity.entity';

export interface PrizeCandidateInterface {
  type: string;
  candidate: UserEntity | OpportunityEntity;
}
