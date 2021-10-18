import { HttpService, Injectable, Logger } from '@nestjs/common';
import { HooksSubscriptionService } from '../../modules/hooksSubscription/hooksSubscription.service';
import { SubscriptionHookEvents } from '../../enum/';
import { isMatch } from 'lodash';

@Injectable()
export class TriggersHookService {
  private logger = new Logger('Initializing Triggers Hook');

  constructor(
    private readonly hooksSubscriptionService: HooksSubscriptionService,
    private readonly httpService: HttpService,
  ) {}
  /**
   * Trigger Integration Hook
   * @param params Object Having Template And Community Info
   * @return Void
   */
  async triggerHook(params: {
    output: {};
    community: number;
    event: SubscriptionHookEvents;
    filter: {};
  }): Promise<void> {
    try {
      const subscriptions = await this.hooksSubscriptionService.getSubscription(
        {
          community: params.community,
          status: true,
          event: params.event,
        },
      );
      if (subscriptions.length) {
        subscriptions.forEach(subscription => {
          if (isMatch(params.filter, subscription.inputData)) {
            this.httpService
              .post(subscription.hookUrl, params.output)
              .toPromise()
              .catch(error =>
                this.logger.error('Rejection From Trigger \n', error),
              );
          }
        });
      }
    } catch (e) {
      this.logger.log('Error In New Opportunity Hook: ', e);
    }
  }
}
