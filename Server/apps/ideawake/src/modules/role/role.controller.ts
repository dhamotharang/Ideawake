import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { RoleService } from './role.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { GetRoleDto } from './dto/GetRoleDto';
import {
  ROLE_ABBREVIATIONS,
  PERMISSIONS_MAP,
} from '../../common/constants/constants';
import { Not } from 'typeorm';
import { CommunityService } from '../community/community.service';

@Controller('role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly communityService: CommunityService,
  ) {}

  @Post()
  async addRole(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.roleService.addRole(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllRoles(
    @Query() queryparams: GetRoleDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      where: {
        ...(queryparams.level && { level: queryparams.level }),
        community: queryparams.community,
      },
    };

    if (queryparams.manageableRoles) {
      const permissions = await this.communityService.getPermissions(
        queryparams.community,
        req['userData'].id,
      );
      if (permissions.manageUserRoles === PERMISSIONS_MAP.SCENARIO) {
        options.where['abbreviation'] = Not(ROLE_ABBREVIATIONS.ADMIN);
      }
    }

    const roles = await this.roleService.getRoles(options);
    return ResponseFormatService.responseOk(roles, 'All');
  }

  @Get(':id')
  async getRole(@Param('id') id: string): Promise<ResponseFormat> {
    const role = await this.roleService.getRoles({ id: id });
    return ResponseFormatService.responseOk(role, 'All');
  }

  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.roleService.updateRole({ id: id }, body);
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeRole(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.roleService.updateRole(
      { id: id },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(
      deleteResponse,
      'Role Archived Successfully',
    );
  }
}
