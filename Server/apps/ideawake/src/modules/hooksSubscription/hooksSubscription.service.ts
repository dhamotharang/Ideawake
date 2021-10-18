import { Injectable } from '@nestjs/common';
import { HooksSubscriptionRepository } from './hooksSubscription.repository';
import { HooksSubscriptionEntity } from './hooksSubscription.entity';

@Injectable()
export class HooksSubscriptionService {
  constructor(
    public readonly hooksSubscriptionRepository: HooksSubscriptionRepository,
  ) {}

  /**
   * Get Hook Subscription
   * @param option Object to filter subscription
   * @return Subscription Object
   */

  async getSubscription(options: {}): Promise<HooksSubscriptionEntity[]> {
    return this.hooksSubscriptionRepository.find(options);
  }

  /**
   * Insert New Subscription
   * @param data Object containing new Subscription
   * @return New Subscription Object
   */

  async addSubscription(data: {}): Promise<HooksSubscriptionEntity> {
    const subscriptionCreated = this.hooksSubscriptionRepository.create({
      ...data,
      isDeleted: false,
    });
    const subscriptionAddResponse = await this.hooksSubscriptionRepository.save(
      subscriptionCreated,
    );
    return subscriptionAddResponse;
  }

  /**
   * Update Existing Subscription
   * @param options Object for options
   * @param data Updated Data Object
   */
  async updateSubscription(options: {}, data: {}): Promise<{}> {
    return this.hooksSubscriptionRepository.update(options, data);
  }

  /**
   * UnSubscribe existing subscription
   * @param options Object for options
   * @returns Row Effected
   */
  async deleteSubscription(options: {}): Promise<{}> {
    return this.hooksSubscriptionRepository.delete(options);
  }
}
