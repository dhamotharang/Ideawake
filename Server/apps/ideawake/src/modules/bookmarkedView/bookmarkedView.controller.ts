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
  ForbiddenException,
} from '@nestjs/common';

import { BookmarkedViewService } from './bookmarkedView.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  AddBookmarkedViewDto,
  GetBookmarkedViewsDto,
  GetBookmarkedViewsPermissionsDto,
} from './dto';
import { Request } from 'express';
import { groupBy, head, omit } from 'lodash';

@Controller('bookmarked-view')
export class BookmarkedViewController {
  constructor(private readonly bookmarkedViewService: BookmarkedViewService) {}

  @Post()
  async addBookmarkedView(
    @Body() body: AddBookmarkedViewDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const user = req['userData'];

    // Save the view.
    const response = await this.bookmarkedViewService.addBookmarkedView({
      ...omit(body, 'visibilitySettings'),
      user: user.id,
      community: user.currentCommunity,
    });

    // Save the visibility settings for the bookmarked view.
    const bookmark = await this.bookmarkedViewService.getBookmarkedView({
      where: { id: response.id },
    });
    this.bookmarkedViewService.saveBookmarkedViewVisSettings(
      body.visibilitySettings,
      bookmark.id,
      bookmark.communityId,
    );

    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllBookmarkedViews(
    @Query() queryParams: GetBookmarkedViewsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const user = req['userData'];
    const bookmarkedViews = await this.bookmarkedViewService.getBookmarkedViewsWithFilters(
      { ...queryParams, community: user.currentCommunity },
    );

    // Filtering out the bookmarks that the user doesn't have permission to view.
    const bookmarkedViewIds = bookmarkedViews.map(bookmark => bookmark.id);
    const permissions = await this.bookmarkedViewService.getBookmarkedViewsPermissions(
      bookmarkedViewIds,
      user.currentCommunity,
      user.id,
    );
    const permissionsGrouped = groupBy(permissions, 'bookmarkedViewId');
    const visibleBookmarkedViews = bookmarkedViews.filter(
      bookmark => head(permissionsGrouped[bookmark.id]).viewBookmarkedView,
    );

    return ResponseFormatService.responseOk(
      visibleBookmarkedViews,
      'All Bookmarked Views.',
    );
  }

  @Post('get-permissions')
  async getBookmarkedViewsPermissions(
    @Body() body: GetBookmarkedViewsPermissionsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const user = req['userData'];
    const permissions = await this.bookmarkedViewService.getBookmarkedViewsPermissions(
      body.bookmarkedViewIds,
      user.currentCommunity,
      user.id,
    );
    return ResponseFormatService.responseOk(
      permissions,
      'Given Bookmarked Views Permissions.',
    );
  }

  @Get(':id')
  async getBookmarkedView(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const bookmarkedView = await this.bookmarkedViewService.getBookmarkedViewWithSettings(
      { where: { id, community: req['userData'].currentCommunity } },
    );
    return bookmarkedView
      ? ResponseFormatService.responseOk(
          bookmarkedView,
          'Bookmarked View Details.',
        )
      : ResponseFormatService.responseNotFound(
          bookmarkedView,
          'Bookmarked View Not Found.',
        );
  }

  @Patch(':id')
  async updateBookmarkedView(
    @Param('id') id: string,
    @Body() body: AddBookmarkedViewDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Check user permission.
    const permissions = await this.bookmarkedViewService.getBookmarkedViewsPermissions(
      [parseInt(id)],
      req['userData'].currentCommunity,
      req['userData'].id,
    );
    if (!head(permissions).manageBookmarkedView) {
      throw new ForbiddenException('Forbidden resource');
    }

    // Update the bookmarked view.
    const updateData = await this.bookmarkedViewService.updateBookmarkedView(
      { id: parseInt(id), community: req['userData'].currentCommunity },
      omit(body, 'visibilitySettings'),
    );

    // Update the visibility settings for the bookmarked view.
    const updatedBookmark = await this.bookmarkedViewService.getBookmarkedView({
      where: { id: parseInt(id), community: req['userData'].currentCommunity },
    });
    this.bookmarkedViewService.updateBookmarkedViewVisibility(
      body.visibilitySettings,
      updatedBookmark.id,
      updatedBookmark.communityId,
    );

    return ResponseFormatService.responseOk(
      updateData,
      'Bookmarked View Updated.',
    );
  }

  @Delete(':id')
  async removeBookmarkedView(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.bookmarkedViewService.deleteBookmarkedView({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(
      deleteData,
      'Bookmarked View Deleted.',
    );
  }
}
