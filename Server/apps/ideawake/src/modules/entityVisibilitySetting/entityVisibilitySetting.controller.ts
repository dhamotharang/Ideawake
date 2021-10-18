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

import { EntityVisibilitySettingService } from './entityVisibilitySetting.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('entity-visibility-setting')
export class EntityVisibilitySettingController {
  constructor(
    private readonly entityVisibilitySettingService: EntityVisibilitySettingService,
  ) {}

  @Post()
  async addEntityVisibilitySetting(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.entityVisibilitySettingService.addEntityVisibilitySetting(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllEntityVisibilitySettings(
    @Query() queryParams,
  ): Promise<ResponseFormat> {
    const entityVisibilitySettings = await this.entityVisibilitySettingService.getEntityVisibilitySettings(
      queryParams,
    );
    return ResponseFormatService.responseOk(entityVisibilitySettings, 'All');
  }

  @Get(':id')
  async getEntityVisibilitySetting(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const entityVisibilitySetting = await this.entityVisibilitySettingService.getEntityVisibilitySettings(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(entityVisibilitySetting, 'All');
  }

  @Patch(':id')
  async updateEntityVisibilitySetting(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.entityVisibilitySettingService.updateEntityVisibilitySetting(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeEntityVisibilitySetting(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.entityVisibilitySettingService.deleteEntityVisibilitySetting(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
