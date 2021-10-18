import { Controller, Get, Query, Logger } from '@nestjs/common';

import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ActionTypeService } from './actionType.service';

@Controller('action-type')
export class ActionTypeController {
  private looger = new Logger('Notification Controller');
  constructor(private actionTypeService: ActionTypeService) {}

  @Get()
  async getAllActionTypes(@Query() queryParams): Promise<ResponseFormat> {
    this.looger.log('getAllActionTypes query', queryParams);
    const notificationData = await this.actionTypeService.getActionTypes(
      queryParams,
    );
    return ResponseFormatService.responseOk(
      notificationData,
      'Notification Get Successfully',
    );
  }
}
