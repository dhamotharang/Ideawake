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

import { EntityExperienceSettingService } from './entityExperienceSetting.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import * as _ from 'lodash';
import { GetBulkDataDto } from './dto';
@Controller('entityExperienceSetting')
export class EntityExperienceSettingController {
  constructor(
    private readonly entityExperienceSettingService: EntityExperienceSettingService,
  ) {}

  @Post()
  async addEntityExperienceSetting(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.entityExperienceSettingService.addEntityExperienceSetting(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Post('get-bulk')
  async getEntitiesExperienceSettings(
    @Body()
    body: GetBulkDataDto,
  ): Promise<ResponseFormat> {
    const resultArray = [];
    _.map(body.entityData, val => {
      resultArray.push(
        this.entityExperienceSettingService.getEntityExperienceSetting({
          where: {
            community: body.community,
            entityObjectId: val.entityObjectId,
            entityType: val.entityType,
          },
        }),
      );
    });
    const finalResult = await Promise.all(resultArray);
    return ResponseFormatService.responseOk(
      finalResult,
      'Entities Experience Settings',
    );
  }
  /**
   * Get some entity's experience settings
   * @param queryParams send entityObjectId, entityType, community as params to get specific exp settings
   */
  @Get()
  async getEntityExperienceSetting(
    @Query() queryParams,
  ): Promise<ResponseFormat> {
    const entityExperienceSetting = await this.entityExperienceSettingService.getEntityExperienceSetting(
      {
        where: queryParams,
      },
    );
    return ResponseFormatService.responseOk([entityExperienceSetting], 'All');
  }

  @Patch(':id')
  async updateEntityExperienceSetting(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.entityExperienceSettingService.updateEntityExperienceSetting(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeEntityExperienceSetting(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.entityExperienceSettingService.deleteEntityExperienceSetting(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
