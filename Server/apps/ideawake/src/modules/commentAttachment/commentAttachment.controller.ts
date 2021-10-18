import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { CommentAttachmentService } from './commentAttachment.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('comment-attachment')
export class CommentAttachmentController {
  constructor(
    private readonly commentAttachmentService: CommentAttachmentService,
  ) {}

  @Post()
  async addCommentAttachment(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.commentAttachmentService.addCommentAttachment(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommentAttachments(): Promise<ResponseFormat> {
    const options = {};
    const commentAttachments = await this.commentAttachmentService.getCommentAttachments(
      options,
    );
    return ResponseFormatService.responseOk(commentAttachments, 'All');
  }

  @Get(':id')
  async getCommentAttachment(@Param('id') id: string): Promise<ResponseFormat> {
    const commentAttachment = await this.commentAttachmentService.getCommentAttachments(
      { id: id },
    );
    return ResponseFormatService.responseOk(commentAttachment, 'All');
  }

  @Patch(':id')
  async updateCommentAttachment(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.commentAttachmentService.updateCommentAttachment(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeCommentAttachment(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.commentAttachmentService.deleteCommentAttachment(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
