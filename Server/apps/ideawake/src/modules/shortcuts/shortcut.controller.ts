import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ShortcutService } from './shortcut.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { AddShortcutDto } from './dto/AddShortcutDto';
import { Request } from 'express';
import { UserShortcuts } from './user.shortcut.entity';
import { getRepository } from 'typeorm';
import { EntityTypeService } from '../entityType/entity.service';
import { CommunityService } from '../community/community.service';
import { EntityMetaService } from './../../shared/services/EntityMeta.service';

@Controller('shortcut')
export class ShortcutController {
  constructor(
    public shortcutService: ShortcutService,
    public entityTypeService: EntityTypeService,
    public communityService: CommunityService,
  ) {}

  @Post()
  async addShortcut(
    @Body() body: AddShortcutDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicateData = await this.shortcutService.getShortcuts({
      where: {
        entityType: body.entityType,
        entityObjectId: body.entityObjectId,
        community: body.community,
      },
      relations: ['userShortcuts', 'community'],
    });
    let response;
    if (duplicateData.length) {
      response = duplicateData[0];
    } else {
      const entity = await this.entityTypeService.getEntityTypes({
        where: {
          entityType: body.entityType,
        },
      });
      const community = await this.communityService.getCommunities({
        where: {
          entityType: body.community,
        },
      });
      if (!entity.length || !community.length) {
        return ResponseFormatService.responseNotFound([], 'Invalid Entity Id');
      }
      body.isDeleted = false;
      body.createdBy = req['userData'].id;
      body.updatedBy = req['userData'].id;
      body.entityType = entity[0];
      body.community = community[0];
      response = await this.shortcutService.addShortcut(body);
    }

    const userShortcutsRepo = getRepository(UserShortcuts);
    const createdData = await userShortcutsRepo.create({
      userId: req['userData'].id,
      shortcutId: response['id'],
    });
    await userShortcutsRepo.save(createdData);

    return ResponseFormatService.responseOk(
      response,
      'Shortcut Added Successfully',
    );
  }

  @Get()
  async getAllShortcuts(): Promise<ResponseFormat> {
    const options = {};
    const response = await this.shortcutService.getShortcuts(options);
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get(':id')
  async getShortcut(@Param('id') id: string): Promise<ResponseFormat> {
    const response = await this.shortcutService.getShortcuts({
      id: id,
    });
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get('user/:id')
  async getUserShortcut(@Param('id') id: string): Promise<ResponseFormat> {
    const userShortcutsRepo = getRepository(UserShortcuts);
    const userData = await userShortcutsRepo.find({
      where: {
        userId: id,
      },
      relations: ['shortcut', 'shortcut.entityType'],
    });
    if (userData.length) {
      for (const iterator of userData) {
        iterator[
          'entityObject'
        ] = await EntityMetaService.getEntityObjectByEntityType(
          iterator.shortcut.entityType.abbreviation,
          iterator.shortcut.entityObjectId,
        );
      }
    }
    return ResponseFormatService.responseOk(userData, 'All');
  }

  @Patch(':id')
  async updateShortcut(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.shortcutService.updateShortcut(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete('user/:id')
  async removeUserShortcuts(@Param('id') id): Promise<ResponseFormat> {
    const userShortcutsRepo = getRepository(UserShortcuts);
    const deleteData = await userShortcutsRepo.delete({ userId: id });
    return ResponseFormatService.responseOk(deleteData, '');
  }

  @Delete(':id')
  async removeShortcut(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.shortcutService.deleteShortcut({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
