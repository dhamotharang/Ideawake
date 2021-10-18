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

import { UserAttachmentService } from './userAttachment.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { UserService } from '../user/user.service';
import * as _ from 'lodash';
import { Not, In } from 'typeorm';
@Controller('user-attachment')
export class UserAttachmentController {
  constructor(
    private readonly userAttachmentService: UserAttachmentService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async addUserAttachment(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.userAttachmentService.addUserAttachment(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllUserAttachments(@Query() queryParams: {}): Promise<
    ResponseFormat
  > {
    const userData = await this.userService.getUsers({
      relations: ['profileImage'],
    });
    if (userData.length) {
      const excludedImageIds = _.compact(
        _.map(_.map(userData, 'profileImage'), 'id'),
      );
      if (excludedImageIds.length) {
        queryParams = { ...{ id: Not(In(excludedImageIds)) }, ...queryParams };
      }
    }

    const options = { where: queryParams };
    const userAttachments = await this.userAttachmentService.getUserAttachments(
      options,
    );
    return ResponseFormatService.responseOk(userAttachments, 'All');
  }

  @Get(':id')
  async getUserAttachment(@Param('id') id: string): Promise<ResponseFormat> {
    const userAttachment = await this.userAttachmentService.getUserAttachments({
      id: id,
    });
    return ResponseFormatService.responseOk(userAttachment, 'All');
  }

  @Patch(':id')
  async updateUserAttachment(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.userAttachmentService.updateUserAttachment(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeUserAttachment(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.userAttachmentService.deleteUserAttachment({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
