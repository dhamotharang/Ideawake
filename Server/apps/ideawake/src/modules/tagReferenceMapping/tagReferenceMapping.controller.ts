import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { TagReferenceMappingService } from './tagReferenceMapping.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('tagReferenceMapping')
export class TagReferenceMappingController {
  constructor(
    private readonly tagReferenceMappingService: TagReferenceMappingService,
  ) {}

  @Post()
  async addTagReferenceMapping(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.tagReferenceMappingService.addTagReferenceMapping(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllTagReferenceMappings(): Promise<ResponseFormat> {
    const options = {};
    const tagReferenceMappings = await this.tagReferenceMappingService.getTagReferenceMappings(
      options,
    );
    return ResponseFormatService.responseOk(tagReferenceMappings, 'All');
  }

  @Get(':id')
  async getTagReferenceMapping(
    @Param('id') prodId: string,
  ): Promise<ResponseFormat> {
    const tagReferenceMapping = await this.tagReferenceMappingService.getTagReferenceMappings(
      {
        prodId: prodId,
      },
    );
    return ResponseFormatService.responseOk(tagReferenceMapping, 'All');
  }

  @Patch(':id')
  async updateTagReferenceMapping(
    @Param('id') prodId: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.tagReferenceMappingService.updateTagReferenceMapping(
      { prodId: prodId },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeTagReferenceMapping(
    @Param('id') prodId: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.tagReferenceMappingService.deleteTagReferenceMapping(
      {
        prodId: prodId,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
