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

import { OpportunityAttachmentService } from './opportunityAttachment.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { Request } from 'express';
import { GetUploadUrlDto } from './dto';
import { AwsS3Service } from '../../shared/services/aws-s3.service';

@Controller('opportunity-attachment')
export class OpportunityAttachmentController {
  constructor(
    private readonly opportunityAttachmentService: OpportunityAttachmentService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Post()
  async addOpportunityAttachment(@Body() body: {}): Promise<ResponseFormat> {
    body['isDeleted'] = false;
    const response = await this.opportunityAttachmentService.addOpportunityAttachment(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllOpportunityAttachments(): Promise<ResponseFormat> {
    const options = {};
    const opportunityAttachments = await this.opportunityAttachmentService.getOpportunityAttachments(
      options,
    );
    return ResponseFormatService.responseOk(opportunityAttachments, 'All');
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
    const opportunityAttachments = await this.opportunityAttachmentService.getOpportunityAttachments(
      options,
    );
    return ResponseFormatService.responseOk(opportunityAttachments, 'All');
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
  async getOpportunityAttachment(
    @Param('id') prodId: string,
  ): Promise<ResponseFormat> {
    const opportunityAttachment = await this.opportunityAttachmentService.getOpportunityAttachments(
      {
        prodId: prodId,
      },
    );
    return ResponseFormatService.responseOk(opportunityAttachment, 'All');
  }

  @Patch(':id')
  async updateOpportunityAttachment(
    @Param('id') prodId: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.opportunityAttachmentService.updateOpportunityAttachment(
      { prodId: prodId },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeOpportunityAttachment(
    @Param('id') prodId: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.opportunityAttachmentService.deleteOpportunityAttachment(
      {
        prodId: prodId,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
