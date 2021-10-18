import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';

import { WidgetService } from './widget.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { Request } from 'express';
import { AddWidgetDto, GetWidgetsDto, UpdateWidgetDto } from './dto';

@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async addWidget(@Body() body: AddWidgetDto): Promise<ResponseFormat> {
    const response = await this.widgetService.addWidget(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllWidgets(
    @Query() queryParams: GetWidgetsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      where: { ...queryParams, community: req['userData'].currentCommunity },
      order: {
        createdAt: 'DESC',
      },
    };

    const widgets = await this.widgetService.getWidgets(options);
    return ResponseFormatService.responseOk(widgets, 'All Widgets');
  }

  @Get(':id')
  async getWidget(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const widget = await this.widgetService.getWidget({
      where: { id: parseInt(id), community: req['userData'].currentCommunity },
    });
    return ResponseFormatService.responseOk(widget, 'Widget Details');
  }

  @Patch(':id')
  async updateWidget(
    @Param('id') id: string,
    @Body() body: UpdateWidgetDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.widgetService.updateWidget(
      { id: parseInt(id), community: req['userData'].currentCommunity },
      body,
    );
    return ResponseFormatService.responseOk(updateData, 'Widget Updated');
  }

  @Delete(':id')
  async archiveWidget(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.widgetService.archiveWidget({
      id: parseInt(id),
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, 'Widget Archived!');
  }
}
