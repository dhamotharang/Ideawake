import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { StatusService } from './status.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { GetCommunityStatusDto } from './dto/GetCommunityStatusDto';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  async addStatus(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.statusService.addStatus(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getCommunityStatuses(
    @Query() queryParams: GetCommunityStatusDto,
  ): Promise<ResponseFormat> {
    const withCounts = queryParams.withCounts || false;
    const challenge = queryParams.challenge;
    delete queryParams.withCounts;
    delete queryParams.challenge;

    const options = {
      where: { ...queryParams },
      order: { orderNumber: 'ASC' },
    };

    let statuses;
    if (!withCounts) {
      statuses = await this.statusService.getStatuses(options);
    } else {
      statuses = await this.statusService.getStatusesWithCounts({
        ...options,
        challenge,
      });
    }
    return ResponseFormatService.responseOk(statuses, 'All');
  }

  @Get(':id')
  async getStatus(@Param('id') id: number): Promise<ResponseFormat> {
    const status = await this.statusService.getOneStatus({ id: id });
    return ResponseFormatService.responseOk(status, 'All');
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: number,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.statusService.updateStatus({ id: id }, body);
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeStatus(@Param('id') id: number): Promise<ResponseFormat> {
    const deleteData = await this.statusService.deleteStatus({ id: id });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
