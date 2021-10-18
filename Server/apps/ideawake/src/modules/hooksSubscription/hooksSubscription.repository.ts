import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { HooksSubscriptionEntity } from './hooksSubscription.entity';

@EntityRepository(HooksSubscriptionEntity)
export class HooksSubscriptionRepository extends Repository<
  HooksSubscriptionEntity
> {}
