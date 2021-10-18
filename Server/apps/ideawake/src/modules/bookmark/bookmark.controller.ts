import { Request } from 'express';
import { getRepository } from 'typeorm';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Query,
} from '@nestjs/common';

import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { CommunityService } from '../community/community.service';
import { EntityTypeService } from '../entityType/entity.service';
import { BookmarkService } from './bookmark.service';
import { AddBookmarkDto } from './dto/AddBookmarkDto';
import { UserBookmarks } from './user.bookmark.entity';

@Controller('bookmark')
export class BookmarkController {
  constructor(
    public bookmarkService: BookmarkService,
    public entityTypeService: EntityTypeService,
    public communityService: CommunityService,
  ) {}

  @Post()
  async addBookmark(
    @Body() body: AddBookmarkDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicateData = await this.bookmarkService.getBookmarks({
      where: {
        entityType: body.entityType,
        entityObjectId: body.entityObjectId,
        community: body.community,
      },
      relations: ['userBookmarks', 'community'],
    });
    let response;
    if (duplicateData.length) {
      req['userData']['community'] = body.community;
      response = duplicateData[0];
    } else {
      const entity = await this.entityTypeService.getEntityTypes({
        where: {
          id: body.entityType,
        },
      });
      const community = await this.communityService.getCommunities({
        where: {
          id: body.community,
        },
      });
      if (!entity.length || !community.length) {
        return ResponseFormatService.responseNotFound([], 'Invalid Entity Id');
      }
      req['userData']['community'] = body.community;
      body.isDeleted = false;
      body.createdBy = req['userData'].id;
      body.updatedBy = req['userData'].id;
      body.entityType = entity[0];
      body.community = community[0];
      response = await this.bookmarkService.addBookmark(body, req['userData']);
    }

    // const userBookmarksRepo = getRepository(UserBookmarks);
    // const createdData = await userBookmarksRepo.create({
    //   userId: req['userData'].id,
    //   bookmarkId: response['id'],
    // });
    // await userBookmarksRepo.save(createdData);
    await this.bookmarkService.addUserBookmarkContent(
      req['userData'],
      response['id'],
    );
    return ResponseFormatService.responseOk(
      response,
      'Bookmark Added Successfully',
    );
  }

  @Get()
  async getAllBookmarks(@Req() req: Request): Promise<ResponseFormat> {
    const response = await this.bookmarkService.getBookmarks({
      where: { community: req['userData'].currentCommunity },
    });
    return ResponseFormatService.responseOk(response, 'All');
  }

  // TODO Change user id type to int after updating DB
  /**
   * Get user's all types of bookmars
   * @returns {array} List of all user specific bookmarks
   */
  @Get('user/all')
  async getUserBookmark(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const bookmarks = await this.bookmarkService.getUserBookmarks(
      queryParams.userId || req['userData'].id,
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(
      bookmarks,
      'All Bookmarks against user',
    );
  }

  /**
   * Get user bookmark by entities
   * @param {string} entityObjectId Entity id to filter out bookmars
   * @returns {array} List of entity specific bookmarks
   */
  @Get('entity/:entityType')
  async getEntityBookmark(
    @Req() req: Request,
    @Query() queryParams,
    @Param('entityType') entityTypeId,
  ): Promise<ResponseFormat> {
    const bookmarks = await this.bookmarkService.getUserBookmarksByEntityType({
      userId: queryParams.userId || req['userData'].id,
      entityTypeId: entityTypeId,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(
      bookmarks,
      'Entity wise bookmarks against user',
    );
  }

  /**
   * Get bookmark counts entities wise
   * @param {string} entityObjectId Entity id to filter out bookmars
   * @returns {array} List of entity specific bookmark counts
   */
  @Get('counts/')
  async getBookmarkCounts(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const bookmarks = await this.bookmarkService.getBookmarkCounts(
      queryParams.userId || req['userData'].id,
      undefined,
      undefined,
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(
      bookmarks,
      'Entity wise bookmark counts',
    );
  }

  @Get(':id')
  async getBookmark(@Param('id') id: string): Promise<ResponseFormat> {
    const response = await this.bookmarkService.getBookmarks({
      id: id,
    });
    return ResponseFormatService.responseOk(response, 'All');
  }

  async updateBookmark(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.bookmarkService.updateBookmark(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete('user/:id/bookmark/:bookmark')
  async removeUserBookmark(
    @Param('id') id,
    @Param('bookmark') bookmark,
  ): Promise<ResponseFormat> {
    const userBookmarksRepo = getRepository(UserBookmarks);
    const deleteData = await userBookmarksRepo.delete({
      userId: id,
      bookmarkId: bookmark,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }

  @Delete(':id')
  async removeBookmark(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.bookmarkService.deleteBookmark({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
