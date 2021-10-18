import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { EmailTemplateService } from './email-template.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddEmailTemplateDto } from './dto';
@Controller('email')
export class EmailTemplatesController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  async addEmailTemplate(
    @Body() body: AddEmailTemplateDto,
  ): Promise<ResponseFormat> {
    const response = await this.emailTemplateService.addEmailTemplate(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllEmailTemplates(): Promise<ResponseFormat> {
    const options = {};
    const emailTemplates = await this.emailTemplateService.getEmailTemplates(
      options,
    );
    return ResponseFormatService.responseOk(emailTemplates, 'All');
  }

  @Get(':id')
  async getEmailTemplate(@Param('id') id: string): Promise<ResponseFormat> {
    const emailTemplate = await this.emailTemplateService.getEmailTemplates({
      id: id,
    });
    return ResponseFormatService.responseOk(emailTemplate, '');
  }

  @Patch(':id')
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateResponse = await this.emailTemplateService.updateEmailTemplate(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateResponse, '');
  }

  @Delete(':id')
  async removeEmailTemplate(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.emailTemplateService.deleteEmailTemplate({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteResponse, '');
  }
}
