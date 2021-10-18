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
import { TenantService } from './tenant.service';

import { CommunityService } from '../community/community.service';
import { MailService } from '../../shared/services/mailer.service';
import { AuthService } from '../../modules/auth/auth.service';
import { UserService } from '../user/user.service';

import { UserAttachmentService } from '../userAttachment/userAttachment.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { RoleService } from '../role/role.service';

@Controller('tenant')
export class TenantsController {
  constructor(
    public readonly communityService: CommunityService,
    public readonly tenantService: TenantService,
    public readonly mailService: MailService,
    public readonly authService: AuthService,
    public readonly userService: UserService,
    public readonly userAttachmentService: UserAttachmentService,
    public readonly roleActorService: RoleActorsService,
    public readonly roleService: RoleService,
  ) {}

  @Post()
  async addTenant(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.tenantService.addTenant(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllTenants(): Promise<ResponseFormat> {
    const options = {};
    const tenants = await this.tenantService.getTenants(options);
    return ResponseFormatService.responseOk(tenants, 'All');
  }

  @Get(':id')
  async getTenant(@Param('id') id: string): Promise<ResponseFormat> {
    const tenant = await this.tenantService.getTenants({ id: id });
    return ResponseFormatService.responseOk(tenant, '');
  }

  @Patch(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const deleteResponse = await this.tenantService.updateTenant(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(deleteResponse, '');
  }

  @Delete(':id')
  async removeTenant(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.tenantService.deleteTenant({ id: id });
    return ResponseFormatService.responseOk(deleteResponse, '');
  }
}
