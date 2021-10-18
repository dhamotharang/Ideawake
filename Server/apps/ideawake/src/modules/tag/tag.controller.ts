import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import {
  AddTagDto,
  SearchTagDto,
  // TagCountByOpportunity
} from './dto';
import { Request } from 'express';
import { UserTags } from './user.tag.entity';
import { getRepository, Like } from 'typeorm';
import { OpportunityService } from '../opportunity/opportunity.service';

@Controller('tag')
export class TagController {
  constructor(
    public tagService: TagService,
    private opportunityService: OpportunityService,
  ) {}

  @Post()
  async addTag(
    @Body() body: AddTagDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicateTag = await this.tagService.getTags({
      where: { name: body.name, community: req['userData'].currentCommunity },
    });
    body.isDeleted = false;
    body.createdBy = req['userData'].id;
    body.updatedBy = req['userData'].id;
    body.user = req['userData'].id;
    if (duplicateTag.length) {
      return ResponseFormatService.responseBadRequest([], 'Duplicate Tag');
    }

    const response = await this.tagService.addTag(body);
    return ResponseFormatService.responseOk(response, 'Tag Added Successfully');
  }

  @Post('user')
  async addUserTag(
    @Body() body: AddTagDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicateTag = await this.tagService.getTags({
      where: { name: body.name, community: req['userData'].currentCommunity },
    });
    body.isDeleted = false;
    body.createdBy = req['userData'].id;
    body.updatedBy = req['userData'].id;
    let tagId;
    if (duplicateTag.length) {
      tagId = duplicateTag[0].id;
    } else {
      const response = await this.tagService.addTag(body);
      tagId = response.id;
    }
    const userTagsRepo = getRepository(UserTags);
    const createdData = await userTagsRepo.create({
      tagId: tagId,
      userId: req['userData'].id,
      entityObjectId: body.entityObjectId,
    });
    await userTagsRepo.save(createdData);
    return ResponseFormatService.responseOk([], 'Tag Added Successfully');
  }

  @Get()
  async getAllTags(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.tagService.getTags({
      where: { ...queryParams, community: req['userData'].currentCommunity },
    });
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get('search')
  async searchAllTags(
    @Query() queryParams: SearchTagDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      where: {
        community: req['userData'].currentCommunity,
        name: Like(`%${queryParams.name ? queryParams.name : ''}%`),
      },
      isDeleted: false,
    };
    const response = await this.tagService.getTags(options);
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get('count-in-ideas')
  async tagCountInIdeas(
    // @Param('id') tagId,
    @Query() queryParams,
    // @Query() queryParams: TagCountByOpportunity,
  ): Promise<ResponseFormat> {
    const promiseArr = [];
    for (const iterator of queryParams.tags) {
      promiseArr.push(
        this.opportunityService.getOpportunitiesCountOnOpportunity(
          queryParams.community,
          queryParams.type,
          iterator,
        ),
      );
    }
    await Promise.all(promiseArr);

    return ResponseFormatService.responseOk(queryParams, 'All');
  }

  @Get(':id')
  async getTag(@Param('id') id: string): Promise<ResponseFormat> {
    const response = await this.tagService.getTags({ id: id });
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get('community/:communityId')
  async getAllTagsByCommunity(
    @Param('communityId') communityId,
    @Query() queryParams,
  ): Promise<ResponseFormat> {
    const options = { where: {} };
    options.where = {
      community: communityId,
      ...queryParams,
      isDeleted: false,
    };
    const response = await this.tagService.getTags(options);
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Patch(':id')
  async updateTag(
    @Param('id') id: string,
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicateTag = await this.tagService.getTags({
      where: {
        name: body['name'],
        community: req['userData'].currentCommunity,
      },
    });
    if (duplicateTag.length) {
      return ResponseFormatService.responseBadRequest([], 'Duplicate Tag');
    }
    const updateData = await this.tagService.updateTag({ id: id }, body);
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete('user/:tagId')
  async removeUserTag(@Param('tagId') tagId): Promise<ResponseFormat> {
    const userTagsRepo = getRepository(UserTags);
    const createdData = await userTagsRepo.delete({
      tagId: tagId,
    });
    return ResponseFormatService.responseOk(
      createdData,
      'Tag Added Successfully',
    );
  }
  @Delete(':id')
  async removeTag(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.tagService.updateTag(
      { id: id },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(deleteData, 'Tag Deleted');
  }
}
