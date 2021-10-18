import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { CommunityWisePermissionService } from './communityWisePermission.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('community-wise-permission')
export class CommunityWisePermissionController {
  constructor(
    private readonly communityWisePermissionService: CommunityWisePermissionService,
  ) {}

  @Post()
  async addCommunityWisePermission(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.communityWisePermissionService.addCommunityWisePermission(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommunityWisePermissions(): Promise<ResponseFormat> {
    const options = {};
    const communityWisePermissions = await this.communityWisePermissionService.getCommunityWisePermissions(
      options,
    );
    return ResponseFormatService.responseOk(communityWisePermissions, 'All');
  }

  @Get(':id')
  async getCommunityWisePermission(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const communityWisePermission = await this.communityWisePermissionService.getCommunityWisePermissions(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(communityWisePermission, 'All');
  }

  @Patch(':id')
  async updateCommunityWisePermission(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.communityWisePermissionService.updateCommunityWisePermission(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeCommunityWisePermission(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.communityWisePermissionService.deleteCommunityWisePermission(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
