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
  UseGuards,
} from '@nestjs/common';

import { IntegrationService } from './integration.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddIntegrationDto } from './dto/AddIntegrationDto';
import { Request } from 'express';
import { EditIntegrationDto } from './dto/EditIntegrationDto';
import { GetCommunityIntegrationsDto } from './dto/GetCommunityIntegrationsDto';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import { PERMISSIONS_KEYS } from '../../common/constants/constants';
import { PermissionsService } from '../../shared/services/permissions.service';
import { PermissionsCondition } from '../../enum/permissions-condition.enum';
import { RequestPermissionsKey } from '../../enum/request-permissions-key.enum';

@Controller('integration')
@UseGuards(PermissionsGuard)
export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.accessIntegrations],
    PermissionsCondition.AND,
  )
  async addIntegration(
    @Body() body: AddIntegrationDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.integrationService.addIntegration({
      ...body,
      user: req['userData'].id,
    });
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.QUERY,
    'community',
    [PERMISSIONS_KEYS.accessIntegrations],
    PermissionsCondition.AND,
  )
  async getCommunityIntegrations(
    @Query() queryParams: GetCommunityIntegrationsDto,
  ): Promise<ResponseFormat> {
    const integrations = await this.integrationService.getIntegrations({
      ...queryParams,
    });
    return ResponseFormatService.responseOk(integrations, 'All');
  }

  @Get(':id')
  async getIntegration(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const integration = await this.integrationService.getOneIntegration({
      where: { id },
      relations: ['community'],
    });
    if (integration) {
      await this.permissionsService.verifyPermissions(
        RoleLevelEnum.community,
        integration.community.id,
        req['userData'].id,
        [PERMISSIONS_KEYS.accessIntegrations],
        PermissionsCondition.AND,
      );
    }
    return ResponseFormatService.responseOk(integration, 'All');
  }

  @Patch(':id')
  async updateIntegration(
    @Param('id') id: number,
    @Body() body: EditIntegrationDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const existingIntegration = await this.integrationService.getOneIntegration(
      { where: { id }, relations: ['community'] },
    );
    if (existingIntegration) {
      await this.permissionsService.verifyPermissions(
        RoleLevelEnum.community,
        existingIntegration.community.id,
        req['userData'].id,
        [PERMISSIONS_KEYS.accessIntegrations],
        PermissionsCondition.AND,
      );
    }
    const updateData = await this.integrationService.updateIntegration(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeIntegration(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const existingIntegration = await this.integrationService.getOneIntegration(
      { where: { id }, relations: ['community'] },
    );
    if (existingIntegration) {
      await this.permissionsService.verifyPermissions(
        RoleLevelEnum.community,
        existingIntegration.community.id,
        req['userData'].id,
        [PERMISSIONS_KEYS.accessIntegrations],
        PermissionsCondition.AND,
      );
    }
    const deleteData = await this.integrationService.softDeleteIntegration({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
