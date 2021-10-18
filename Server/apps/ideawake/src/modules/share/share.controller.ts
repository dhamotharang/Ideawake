import {
  Controller,
  Post,
  Get,
  // Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { AddShareDto, GetAllShares, GetShare, GetShareQuery } from './dto';
import { Request } from 'express';
import { In } from 'typeorm';
import * as _ from 'lodash';
import { ShareEntity } from './share.entity';
@Controller('share')
export class ShareController {
  constructor(public shareService: ShareService) {}

  @Post()
  async addShare(
    @Body() body: AddShareDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicatShare = await this.shareService.getShare({
      where: {
        sharedWith: In(body.sharedWith),
        entityObjectId: body.entityObjectId,
        entityType: body.entityType,
      },
    });
    if (duplicatShare.length) {
      return ResponseFormatService.responseBadRequest([], 'Duplicate Share');
    }
    const sharingData = [];
    _.map(body.sharedWith, val => {
      sharingData.push({
        sharedWith: val,
        sharedBy: req['userData'].id,
        isDeleted: false,
        createdBy: req['userData'].id,
        updatedBy: req['userData'].id,
        entityObjectId: body.entityObjectId,
        entityType: body.entityType,
        community: body.community,
        message: body.message,
      });
    });
    req['userData']['community'] = body.community;
    const response = await this.shareService.addShare(
      sharingData,
      req['userData'],
    );
    return ResponseFormatService.responseOk(
      response,
      'Share Added Successfully',
    );
  }

  @Get()
  async getAllShares(
    @Query() queryParams: GetAllShares,
  ): Promise<ResponseFormat> {
    const where = { community: queryParams.community };
    const response = await this.shareService.getAllShare({
      where,
      relations: ['sharedWith', 'sharedBy'],
    });
    return ResponseFormatService.responseOk(response, 'All Shares');
  }

  @Get('get-shared-with-ids/:type/:entityObjectId')
  async getSharedWithIds(
    @Query() queryParams: GetShareQuery,
    @Param() param: GetShare,
  ): Promise<ResponseFormat> {
    const where = {
      community: queryParams.community,
      entityObjectId: param.entityObjectId,
      abbreviation: param.type,
    };
    const response = await this.shareService.getAllTypeShare(where);
    const finalData = [];
    _.map(response, (val: ShareEntity) => {
      finalData.push({
        userId: val.sharedWith.id,
        shareId: val.id,
      });
    });
    return ResponseFormatService.responseOk(finalData, 'Shared With');
  }

  @Get(':type/:entityObjectId')
  async getShare(
    @Query() queryParams: GetShareQuery,
    @Param() param: GetShare,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const where = {
      community: queryParams.community,
      sharedWith: req['userData'].id,
      entityObjectId: param.entityObjectId,
      abbreviation: param.type,
    };
    const response = await this.shareService.getTypeShare(where);
    return ResponseFormatService.responseOk(response, 'Share');
  }

  @Delete()
  async removeTag(@Body('ids') ids): Promise<ResponseFormat> {
    const deleteData = await this.shareService.deleteShare({ id: In(ids) });
    return ResponseFormatService.responseOk(deleteData, 'Share Deleted');
  }
}
