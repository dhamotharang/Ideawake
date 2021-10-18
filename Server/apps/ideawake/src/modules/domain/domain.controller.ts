import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainsController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  async addDomain(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.domainService.addDomain(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllDomains(): Promise<ResponseFormat> {
    const options = {};
    const domains = await this.domainService.getDomains(options);
    return ResponseFormatService.responseOk(domains, 'All');
  }

  @Get(':id')
  async getDomain(@Param('id') id: string): Promise<ResponseFormat> {
    const domain = await this.domainService.getDomains({ id: id });
    return ResponseFormatService.responseOk(domain, '');
  }

  @Patch(':id')
  async updateDomain(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateResponse = await this.domainService.updateDomain(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateResponse, '');
  }

  @Delete(':id')
  async removeDomain(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.domainService.deleteDomain({ id: id });
    return ResponseFormatService.responseOk(deleteResponse, '');
  }
}
