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

import { ChallengeAttachmentService } from './challengeAttachment.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { Request } from 'express';
import { GetUploadUrlDto } from './dto';
import { AwsS3Service } from '../../shared/services/aws-s3.service';

@Controller('opportunity-attachment')
export class ChallengeAttachmentController {
  constructor(
    private readonly ohallengeAttachmentService: ChallengeAttachmentService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Post()
  async addChallengeAttachment(@Body() body: {}): Promise<ResponseFormat> {
    body['isDeleted'] = false;
    const response = await this.ohallengeAttachmentService.addChallengeAttachment(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllChallengeAttachments(): Promise<ResponseFormat> {
    const options = {};
    const ohallengeAttachments = await this.ohallengeAttachmentService.getChallengeAttachments(
      options,
    );
    return ResponseFormatService.responseOk(ohallengeAttachments, 'All');
  }

  @Get('recent')
  async getRecentUploads(
    @Query()
    queryParams: { opportunityType: string; opportunity: string },
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      user: req['userData'].id,
      opportunityType: queryParams.opportunityType
        ? queryParams.opportunityType
        : '',
      opportunity: queryParams.opportunity ? queryParams.opportunity : '',
    };
    const ohallengeAttachments = await this.ohallengeAttachmentService.getChallengeAttachments(
      options,
    );
    return ResponseFormatService.responseOk(ohallengeAttachments, 'All');
  }

  @Get('get-upload-url')
  async getUploadUrl(
    @Query()
    queryParams: GetUploadUrlDto,
  ): Promise<ResponseFormat> {
    const signedUrlConfig = await this.awsS3Service.getSignedUrl2(
      queryParams.fileName,
      queryParams.contentType,
      'attachments/opportunity/',
    );
    return ResponseFormatService.responseOk(signedUrlConfig, 'All');
  }

  @Get(':id')
  async getChallengeAttachment(
    @Param('id') prodId: string,
  ): Promise<ResponseFormat> {
    const ohallengeAttachment = await this.ohallengeAttachmentService.getChallengeAttachments(
      {
        prodId: prodId,
      },
    );
    return ResponseFormatService.responseOk(ohallengeAttachment, 'All');
  }

  @Patch(':id')
  async updateChallengeAttachment(
    @Param('id') prodId: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.ohallengeAttachmentService.updateChallengeAttachment(
      { prodId: prodId },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeChallengeAttachment(
    @Param('id') prodId: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.ohallengeAttachmentService.deleteChallengeAttachment(
      {
        prodId: prodId,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
