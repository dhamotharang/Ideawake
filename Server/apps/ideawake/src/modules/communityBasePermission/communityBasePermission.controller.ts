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

import { CommunityBasePermissionService } from './communityBasePermission.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddCommunityBasePermissionDto } from './dto';

@Controller('community-base-permission')
export class CommunityBasePermissionController {
  constructor(
    private readonly communityBasePermissionService: CommunityBasePermissionService,
  ) {}

  @Post()
  async addCommunityBasePermission(
    @Body() body: AddCommunityBasePermissionDto,
  ): Promise<ResponseFormat> {
    body.isDeleted = false;
    const response = await this.communityBasePermissionService.addCommunityBasePermission(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommunityBasePermissions(
    @Query() queryParams,
  ): Promise<ResponseFormat> {
    const options = { relations: [], where: {} };
    queryParams.relations = ['community'];
    options.where = {
      ...queryParams,
    };
    const communityBasePermissions = await this.communityBasePermissionService.getCommunityBasePermissions(
      options,
    );
    return ResponseFormatService.responseOk(communityBasePermissions, 'All');
  }

  @Get(':id')
  async getCommunityBasePermission(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const communityBasePermission = await this.communityBasePermissionService.getCommunityBasePermissions(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(communityBasePermission, 'All');
  }

  @Patch(':id')
  async updateCommunityBasePermission(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.communityBasePermissionService.updateCommunityBasePermission(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeCommunityBasePermission(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteResponse = await this.communityBasePermissionService.updateCommunityBasePermission(
      { id: id },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(
      deleteResponse,
      'Setting Type Archived Successfully',
    );
  }
}
