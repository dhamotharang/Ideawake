import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';

import { AuthIntegrationService } from './authIntegration.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { PERMISSIONS_KEYS } from '../../common/constants/constants';
import {
  AddAuthIntegrationDto,
  GetCommunityAuthIntegrationsDto,
  EditAuthIntegrationDto,
} from './dto';
import {
  RoleLevelEnum,
  RequestPermissionsKey,
  PermissionsCondition,
  AuthTypeEnum,
} from '../../enum';

@Controller('auth-integration')
@UseGuards(PermissionsGuard)
export class AuthIntegrationController {
  constructor(
    private readonly authIntegrationService: AuthIntegrationService,
  ) {}

  @Post()
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.accessBasicSettings],
    PermissionsCondition.AND,
  )
  async addAuthIntegration(
    @Body() body: AddAuthIntegrationDto,
  ): Promise<ResponseFormat> {
    const response = await this.authIntegrationService.addAuthIntegration({
      ...body,
    });
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Put()
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.accessBasicSettings],
    PermissionsCondition.AND,
  )
  async manageAuthIntegration(
    @Body() body: EditAuthIntegrationDto,
  ): Promise<ResponseFormat> {
    const response = await this.authIntegrationService.manageAuthIntegration({
      authProvider: 'SSO',
      authType: AuthTypeEnum.SAML,
      ...body,
    });
    return ResponseFormatService.responseOk(
      response,
      response['affected'] ? 'Updated Successfully' : 'Created Successfully',
    );
  }

  @Get()
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.QUERY,
    'community',
    [PERMISSIONS_KEYS.accessBasicSettings],
    PermissionsCondition.AND,
  )
  async getCommunityAuthIntegrations(
    @Query() queryParams: GetCommunityAuthIntegrationsDto,
  ): Promise<ResponseFormat> {
    const authIntegrations = await this.authIntegrationService.getAuthIntegrations(
      {
        ...queryParams,
      },
    );
    return ResponseFormatService.responseOk(authIntegrations, 'All');
  }

  @Get(':id')
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.accessBasicSettings],
    PermissionsCondition.AND,
  )
  async getAuthIntegration(
    @Param('id') id: number,
    @Query() queryParams: GetCommunityAuthIntegrationsDto,
  ): Promise<ResponseFormat> {
    const authIntegration = await this.authIntegrationService.getOneAuthIntegration(
      { where: { id, ...queryParams } },
    );
    return ResponseFormatService.responseOk(authIntegration, 'All');
  }

  @Patch(':id')
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.accessBasicSettings],
    PermissionsCondition.AND,
  )
  async updateAuthIntegration(
    @Param('id') id: number,
    @Body() body: EditAuthIntegrationDto,
  ): Promise<ResponseFormat> {
    const updateData = await this.authIntegrationService.updateAuthIntegration(
      { id: id, community: body.community },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.accessBasicSettings],
    PermissionsCondition.AND,
  )
  async removeAuthIntegration(
    @Param('id') id: number,
    @Query() queryParams: GetCommunityAuthIntegrationsDto,
  ): Promise<ResponseFormat> {
    const deleteRes = await this.authIntegrationService.softDeleteAuthIntegration(
      {
        id: id,
        ...queryParams,
      },
    );
    return ResponseFormatService.responseOk(deleteRes, '');
  }
}
