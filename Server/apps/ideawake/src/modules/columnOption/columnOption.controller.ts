import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Req,
  Put,
} from '@nestjs/common';

import { ColumnOptionService } from './columnOption.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { GetColumnOptionsDto } from './dto/GetColumnOptionsDto';
import { Request } from 'express';
import { PutColumnOptionDto } from './dto/PutColumnOptionDto';

@Controller('column-option')
export class ColumnOptionController {
  constructor(private readonly columnOptionService: ColumnOptionService) {}

  @Post()
  async addColumnOption(
    @Body() body: PutColumnOptionDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.columnOptionService.addColumnOption({
      ...body,
      user: req['userData'].id,
    });
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllColumnOptions(
    @Query() queryParams: GetColumnOptionsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const columnOptions = await this.columnOptionService.getColumnOptions({
      where: {
        ...queryParams,
        user: req['userData'].id,
      },
    });
    return ResponseFormatService.responseOk(columnOptions, 'Column Options');
  }

  @Get(':id')
  async getColumnOption(@Param('id') id: string): Promise<ResponseFormat> {
    const columnOption = await this.columnOptionService.getColumnOptions({
      where: { id: id },
    });
    return ResponseFormatService.responseOk(columnOption, 'All');
  }

  @Put()
  async addOrUpdateColumnOption(
    @Body() body: PutColumnOptionDto,
  ): Promise<ResponseFormat> {
    const updateData = await this.columnOptionService.addOrUpdateColumnOption({
      ...body,
    });
    return ResponseFormatService.responseOk(
      updateData,
      updateData['affected'] ? 'Updated' : 'Created',
    );
  }
}
