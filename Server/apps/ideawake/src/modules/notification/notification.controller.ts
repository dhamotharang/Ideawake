import { Controller, Get, Logger, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller()
export class NotificationController {
  private looger = new Logger('Notification Controller');

  constructor(private readonly NotificationService: NotificationService) {}

  @Get('notification')
  async getNotification(@Query() param): Promise<ResponseFormat> {
    this.looger.log('Get Notification from microservice: ' + param.data);
    const notificationData = await this.NotificationService.notificaionmsg(
      param.data,
    );
    return ResponseFormatService.responseOk(
      { notificationData },
      'Notification Get Successfully',
    );
  }
}
