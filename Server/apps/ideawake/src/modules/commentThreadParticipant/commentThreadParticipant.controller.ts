import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { CommentThreadParticipantService } from './commentThreadParticipant.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('comment-thread-participant')
export class CommentThreadParticipantController {
  constructor(
    private readonly commentThreadParticipantService: CommentThreadParticipantService,
  ) {}

  @Post()
  async addCommentThreadParticipant(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.commentThreadParticipantService.addCommentThreadParticipant(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommentThreadParticipants(): Promise<ResponseFormat> {
    const options = {};
    const commentThreadParticipants = await this.commentThreadParticipantService.getCommentThreadParticipants(
      options,
    );
    return ResponseFormatService.responseOk(commentThreadParticipants, 'All');
  }

  @Get(':id')
  async getCommentThreadParticipant(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const commentThreadParticipant = await this.commentThreadParticipantService.getCommentThreadParticipants(
      { id: id },
    );
    return ResponseFormatService.responseOk(commentThreadParticipant, 'All');
  }

  @Patch(':id')
  async updateCommentThreadParticipant(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.commentThreadParticipantService.updateCommentThreadParticipant(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeCommentThreadParticipant(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.commentThreadParticipantService.deleteCommentThreadParticipant(
      { id: id },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
