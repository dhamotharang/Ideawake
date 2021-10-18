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

import { CommunitySettingService } from './communitySetting.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddCommunitySettingDto } from './dto';

@Controller('community-setting')
export class CommunitySettingController {
  constructor(
    private readonly communitySettingService: CommunitySettingService,
  ) {}

  @Post()
  async addCommunitySetting(
    @Body() body: AddCommunitySettingDto,
  ): Promise<ResponseFormat> {
    const response = await this.communitySettingService.addCommunitySetting(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommunitySettings(@Query() queryParams): Promise<ResponseFormat> {
    const options = { where: {} };
    options.where = {
      ...queryParams,
    };
    const communitySettings = await this.communitySettingService.getCommunitySettings(
      options,
    );
    return ResponseFormatService.responseOk(communitySettings, 'All');
  }

  @Get(':id')
  async getCommunitySetting(@Param('id') id: string): Promise<ResponseFormat> {
    const communitySetting = await this.communitySettingService.getCommunitySettings(
      {
        where: { id: id },
      },
    );
    return ResponseFormatService.responseOk(communitySetting, 'All');
  }

  @Patch(':id')
  async updateCommunitySetting(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.communitySettingService.updateCommunitySetting(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeCommunitySetting(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteResponse = await this.communitySettingService.updateCommunitySetting(
      { id: id },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(
      deleteResponse,
      'Setting Archived Successfully',
    );
  }
}
