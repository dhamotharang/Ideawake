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
} from '@nestjs/common';

import { RoleActorsService } from './roleActors.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { Request } from 'express';
import { GetEntityPermissionsDto } from './dto/GetEntityPermissionsDto';

@Controller('role-actors')
export class RoleActorsController {
  constructor(private readonly roleActorsService: RoleActorsService) {}

  @Post()
  async addRoleActors(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.roleActorsService.addRoleActors(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllRoleActorss(): Promise<ResponseFormat> {
    const options = {};
    const roleActorss = await this.roleActorsService.getRoleActors(options);
    return ResponseFormatService.responseOk(roleActorss, 'All');
  }

  @Get('actor-entity-roles')
  async getActorRoles(
    @Query() queryParams: GetEntityPermissionsDto,
  ): Promise<ResponseFormat> {
    const actorRoles = await this.roleActorsService.getActorEntityRoles(
      queryParams.actorType,
      queryParams.actorId,
      queryParams.entityObjectId || null,
      queryParams.entityType || null,
      queryParams.community,
    );
    return ResponseFormatService.responseOk(actorRoles, 'All');
  }

  @Get('my-entity-roles')
  async getMyRoles(
    @Query() queryParams: GetEntityPermissionsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      userId: req['userData'].id,
    };
    const actorRoles = await this.roleActorsService.getMyEntityRoles(
      queryParams.entityObjectId || null,
      queryParams.entityType || null,
      queryParams.community,
      options,
    );
    return ResponseFormatService.responseOk(actorRoles, 'All');
  }

  @Get('actor-entity-permissions')
  async getActorEntityPermissions(
    @Query() queryParams: GetEntityPermissionsDto,
  ): Promise<ResponseFormat> {
    const permissions = await this.roleActorsService.getActorEntityPermissions(
      queryParams.actorType,
      queryParams.actorId,
      queryParams.entityObjectId || null,
      queryParams.entityType || null,
      queryParams.community,
    );
    return ResponseFormatService.responseOk(permissions, 'All');
  }

  @Get('my-entity-permissions')
  async getMyEntityPermissions(
    @Query() queryParams: GetEntityPermissionsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      userId: req['userData'].id,
    };
    const permissions = await this.roleActorsService.getEntityPermissions(
      queryParams.entityObjectId || null,
      queryParams.entityType || null,
      queryParams.community,
      options,
    );
    return ResponseFormatService.responseOk(permissions, 'All');
  }

  @Get(':id')
  async getRoleActors(@Param('id') id: string): Promise<ResponseFormat> {
    const roleActors = await this.roleActorsService.getRoleActors({
      where: { id: id },
    });
    return ResponseFormatService.responseOk(roleActors, 'All');
  }

  @Patch(':id')
  async updateRoleActors(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.roleActorsService.updateRoleActors(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeRoleActors(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.roleActorsService.deleteRoleActors({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
