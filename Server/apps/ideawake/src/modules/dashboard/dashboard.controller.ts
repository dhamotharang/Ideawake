import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  Query,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { Request } from 'express';
import { AddDashboardDto, GetDashboardsDto, UpdateDashboardDto } from './dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async addDashboard(@Body() body: AddDashboardDto): Promise<ResponseFormat> {
    const response = await this.dashboardService.addDashboard(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllDashboards(
    @Query() queryParams: GetDashboardsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const dashboards = await this.dashboardService.getDashboards({
      where: { ...queryParams, community: req['userData'].currentCommunity },
    });
    return ResponseFormatService.responseOk(dashboards, 'All Dashboards');
  }

  @Get(':id')
  async getDashboard(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const dashboard = await this.dashboardService.getDashboard({
      where: { id: parseInt(id), community: req['userData'].currentCommunity },
    });
    return ResponseFormatService.responseOk(dashboard, 'Dashboard Details');
  }

  @Patch(':id')
  async updateDashboard(
    @Param('id') id: string,
    @Body() body: UpdateDashboardDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.dashboardService.updateDashboard(
      { id: parseInt(id), community: req['userData'].currentCommunity },
      body,
    );
    return ResponseFormatService.responseOk(updateData, 'Dashboard Updated!');
  }

  @Delete(':id')
  async archiveDashboard(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.dashboardService.archiveDashboard({
      id: parseInt(id),
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, 'Dashboard Archived!');
  }
}
