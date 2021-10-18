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

import { UserActionPointService } from './userActionPoint.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { GetUserActionPointDto } from './dto';
import * as _ from 'lodash';
@Controller('user-action-point')
export class UserActionPointController {
  constructor(
    private readonly userActionPointService: UserActionPointService,
  ) {}

  @Post()
  async addUserActionPoint(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.userActionPointService.addUserActionPoint(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllUserActionPoints(
    @Query() queryParams: GetUserActionPointDto,
  ): Promise<ResponseFormat> {
    const userActionPoints = await this.userActionPointService.getUserActionPointsProcess(
      queryParams,
    );
    return ResponseFormatService.responseOk(userActionPoints, 'All');
  }

  @Get(':id')
  async getUserActionPoint(@Param('id') id: string): Promise<ResponseFormat> {
    const userActionPoint = await this.userActionPointService.getUserActionPoints(
      { id: id },
    );
    return ResponseFormatService.responseOk(userActionPoint, 'All');
  }

  @Patch(':id')
  async updateUserActionPoint(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.userActionPointService.updateUserActionPoint(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeUserActionPoint(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.userActionPointService.deleteUserActionPoint({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
