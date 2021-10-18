import {
  Controller,
  Body,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { ActionItemService } from './actionItem.service';
import { ActionItemLogService } from './actionItemLog.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { GetActionItemLogsDto, GetActionItemLogsStatusCountsDto } from './dto';

@Controller('action-item')
export class ActionItemController {
  constructor(
    private readonly actionItemService: ActionItemService,
    private actionItemLogService: ActionItemLogService,
  ) {}

  @Get()
  async getAllActionItems(): Promise<ResponseFormat> {
    const actionItems = await this.actionItemService.getActionItems({
      where: { isDeleted: false },
      order: { id: 'ASC' },
    });
    return ResponseFormatService.responseOk(actionItems, 'All');
  }

  @Get('notifications')
  async searchAllActionItemNotifications(
    @Query() queryParams: GetActionItemLogsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const actionItemLogData = await this.actionItemLogService.searchActionItemLogs(
      {
        options: {
          entityObjectId: queryParams.entityObjectId,
          entityTypeName: queryParams.entityTypeName,
          community: req['userData'].currentCommunity,
          userId: req['userData'].id,
          actionItemId: queryParams.actionItemId,
          actionItemAbbreviation: queryParams.actionItemAbbreviation,
          take: queryParams.take,
          skip: queryParams.skip,
          orderBy: queryParams.orderBy,
          orderType: queryParams.orderType,
          status: queryParams.status,
          isNotification: true,
        },
      },
    );
    return ResponseFormatService.responseOk(actionItemLogData, '');
  }

  @Get('logs/status-counts')
  async getActionItemLogsStatusCounts(
    @Query() queryParams: GetActionItemLogsStatusCountsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const counts = await this.actionItemLogService.getActionItemLogsStatusCounts(
      {
        community: req['userData'].currentCommunity,
        userId: req['userData'].id,
        actionItemId: queryParams.actionItemId,
        actionItemAbbreviation: queryParams.actionItemAbbreviation,
        isNotification: true,
      },
    );
    return ResponseFormatService.responseOk(
      counts,
      'Action item logs status-wise counts.',
    );
  }

  @Get(':id')
  async getActionItem(@Param('id') id: string): Promise<ResponseFormat> {
    const actionItem = await this.actionItemService.getActionItems({ id: id });
    return ResponseFormatService.responseOk(actionItem, 'All');
  }

  @Patch('notifications/mark-read')
  async readNotifications(
    @Body() body: number[],
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const logUpdateRes = await this.actionItemLogService.updateReadStatus({
      id: body,
      community: req['userData'].currentCommunity,
      userId: req['userData'].id,
    });
    return ResponseFormatService.responseOk(logUpdateRes, 'Marked Read!');
  }
}
