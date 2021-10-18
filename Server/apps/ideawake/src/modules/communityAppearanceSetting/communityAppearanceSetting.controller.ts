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

import { CommunityAppearanceSettingService } from './communityAppearanceSetting.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { GetImageUploadUrl } from '../../common/dto/GetImageUploadUrl';
import { AddEditCommunityAppearanceSettingDto } from './dto/AddEditCommunityAppearanceSettingDto';
import { AwsS3Service } from '../../shared/services/aws-s3.service';

@Controller('community-appearance-setting')
export class CommunityAppearanceSettingController {
  constructor(
    private readonly CommunityAppearanceSettingService: CommunityAppearanceSettingService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Get('get-upload-url')
  async getUploadUrl(
    @Query()
    queryParams: GetImageUploadUrl,
  ): Promise<ResponseFormat> {
    const signedUrlConfig = await this.awsS3Service.getSignedUrl2(
      queryParams.fileName,
      queryParams.contentType,
      'attachments/community/',
    );
    return ResponseFormatService.responseOk(signedUrlConfig, 'All');
  }

  @Post()
  async addCommunityAppearanceSetting(
    @Body() body: AddEditCommunityAppearanceSettingDto,
  ): Promise<ResponseFormat> {
    body['isDeleted'] = false;
    const response = await this.CommunityAppearanceSettingService.addCommunityAppearanceSetting(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommunityAppearanceSettings(
    @Query() queryParams,
  ): Promise<ResponseFormat> {
    const options = { where: {} };
    options.where = {
      ...queryParams,
    };
    const CommunityAppearanceSettings = await this.CommunityAppearanceSettingService.getCommunityAppearanceSettings(
      options,
    );
    return ResponseFormatService.responseOk(CommunityAppearanceSettings, 'All');
  }

  @Get(':id')
  async getCommunityAppearanceSetting(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const CommunityAppearanceSetting = await this.CommunityAppearanceSettingService.getCommunityAppearanceSettings(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(CommunityAppearanceSetting, 'All');
  }

  @Patch(':id')
  async updateCommunityAppearanceSetting(
    @Param('id') id: string,
    @Body() body: AddEditCommunityAppearanceSettingDto,
  ): Promise<ResponseFormat> {
    const updateData = await this.CommunityAppearanceSettingService.updateCommunityAppearanceSetting(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, 'Updated Successfully');
  }

  @Delete(':id')
  async removeCommunityAppearanceSetting(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.CommunityAppearanceSettingService.updateCommunityAppearanceSetting(
      { id: id },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(deleteData, 'Deleted Successfully');
  }
}
