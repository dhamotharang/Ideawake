import { Request } from 'express';
import * as _ from 'lodash';

import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';

import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { CommentAttachmentService } from '../commentAttachment/commentAttachment.service';
import { CommentThreadGateway } from '../commentThread/commentThread.gateway';
import { CommentThreadService } from '../commentThread/commentThread.service';
import { CommentThreadParticipantService } from '../commentThreadParticipant/commentThreadParticipant.service';
import { CommentEntity } from './comment.entity';
import { CommentService } from './comment.service';
import { AddCommentDto, EditCommentDto } from './dto';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentThreadService: CommentThreadService,
    private readonly commentThreadParticipantService: CommentThreadParticipantService,
    private readonly commentAttachmentService: CommentAttachmentService,
    private readonly commentThreadGateway: CommentThreadGateway,
  ) {}

  @Post()
  async addComment(
    @Body() body: AddCommentDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    let addedCommentData: CommentEntity;
    const commentData = {
      commentThread: body.commentThread,
      user: req['userData'].id,
      message: body.message,
      tags: body.tags,
      mentions: body.mentions,
      anonymous: body.anonymous,
      isDeleted: false,
      entityType: body.entityType,
      entityObjectId: body.entityObjectId,
      community: body.community,
    };
    if (!body.commentThread) {
      const commentThreadData = {
        entityType: body.entityType,
        entityObjectId: body.entityObjectId,
        user: req['userData'].id,
        community: body.community,
      };
      const commentThreadAdded = await this.commentThreadService.addCommentThread(
        commentThreadData,
      );
      commentData.commentThread = commentThreadAdded.id;
      req['userData']['community'] = body.community;
      addedCommentData = await this.commentService.addComment(
        commentData,
        req['userData'],
        false,
      );
    } else {
      delete commentData.commentThread;
      req['userData']['community'] = body.community;
      addedCommentData = await this.commentService.addComment(
        commentData,
        req['userData'],
        true,
      );
      const commentThreadParticipantData = {
        commentThread: body.commentThread,
        user: req['userData'].id,
        comment: addedCommentData.id,
      };
      await this.commentThreadParticipantService.addCommentThreadParticipant(
        commentThreadParticipantData,
      );
    }

    if (body.attachments.length) {
      const newAttachmentsData = [];
      _.map(
        body.attachments,
        (
          val: {
            url: string;
            attachmentType: string;
            isSelected: number;
            size: number;
            userAttachment: string;
          },
          _key,
        ) => {
          newAttachmentsData.push({
            attachmentType: val.attachmentType,
            isDeleted: false,
            userAttachment: val.userAttachment,
            comment: addedCommentData.id,
          });
        },
      );
      await this.commentAttachmentService.addCommentAttachment(
        newAttachmentsData,
      );
    }
    await this.commentThreadGateway.pushCommentThread(
      body.community,
      body.entityObjectId,
    );
    return ResponseFormatService.responseOk(
      addedCommentData,
      'Created Successfully',
    );
  }

  @Get()
  async getAllComments(): Promise<ResponseFormat> {
    const options = {};
    const comments = await this.commentService.getComments(options);
    return ResponseFormatService.responseOk(comments, 'All');
  }

  @Get(':id')
  async getComment(@Param('id') id: string): Promise<ResponseFormat> {
    const comment = await this.commentService.getComments({ id: id });
    return ResponseFormatService.responseOk(comment, 'All');
  }

  @Patch(':id')
  async updateComment(
    @Param('id') id,
    @Body() body: EditCommentDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (body.attachments && body.attachments.length > 0) {
      await this.commentAttachmentService.deleteCommentAttachment({
        comment: id,
      });
      const newAttachmentsData = [];
      _.map(
        body.attachments,
        (
          val: {
            url: string;
            attachmentType: string;
            isSelected: number;
            size: number;
            userAttachment: string;
          },
          _key,
        ) => {
          newAttachmentsData.push({
            attachmentType: val.attachmentType,
            isDeleted: false,
            userAttachment: val.userAttachment,
            comment: id,
          });
        },
      );
      await this.commentAttachmentService.addCommentAttachment(
        newAttachmentsData,
      );
    } else {
      await this.commentAttachmentService.deleteCommentAttachment({
        comment: id,
      });
    }
    delete body.attachments;

    const updateData = await this.commentService.updateComment(
      { id: id },
      body,
      req['userData'],
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(
      updateData,
      'Comment Updated Success',
    );
  }
}
