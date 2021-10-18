import { Controller, Post, Body, Req, Delete } from '@nestjs/common';
import { HooksSubscriptionDto, HooksUnSubscriptionDto } from './dto/';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { HooksSubscriptionService } from './hooksSubscription.service';
import { Request } from 'express';

@Controller('subscription')
export class HooksSubscriptionController {
  constructor(public hooksSubscriptionService: HooksSubscriptionService) {}

  @Post()
  /**
   * Subscribe Rest Base hook
   * @param body Get Data from Intergration
   * @param request Request from express
   */
  async subscribe(
    @Body() body: HooksSubscriptionDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const subscription = await this.hooksSubscriptionService.addSubscription({
      ...body,
      createdBy: req['userData'].id,
      updatedBy: req['userData'].id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(
      subscription,
      'Hook Subscribed Successfully',
    );
  }
  /**
   * UnSubscribe Rest Base hook
   * @param hookUrl Hook url to unsubscribe
   * @param request Request from express
   */
  @Delete()
  async unSubscribe(
    @Body() body: HooksUnSubscriptionDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.hooksSubscriptionService.deleteSubscription({
      hookUrl: body.hookUrl,
      event: body.event,
      source: body.source,
      community: req['userData'].currentCommunity,
      createdBy: req['userData'].id,
    });
    return ResponseFormatService.responseOk(
      updateData,
      'Unsubscribe Successfully',
    );
  }
}
