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
import { FollowingContentService } from './followingContent.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { AddFollowingContentDto, GetUserFollowersDto } from './dto';
import { Request } from 'express';
import { UserFollowingContents } from './user.followingContent.entity';
import { getRepository } from 'typeorm';
import { EntityTypeService } from '../entityType/entity.service';
import { CommunityService } from '../community/community.service';
import { EntityMetaService } from './../../shared/services/EntityMeta.service';
import { UserService } from '../user/user.service';
import {
  DUMMY_DATA_OBJECTS,
  ENTITY_TYPES,
} from '../../common/constants/constants';
@Controller('following-content')
export class FollowingContentController {
  constructor(
    public followingContentService: FollowingContentService,
    public entityTypeService: EntityTypeService,
    public communityService: CommunityService,
    public userService: UserService,
  ) {}

  @Post()
  async addFollowingContent(
    @Body() body: AddFollowingContentDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicateData = await this.followingContentService.getFollowingContents(
      {
        where: {
          entityType: body.entityType,
          entityObjectId: body.entityObjectId,
          community: body.community,
        },
        relations: ['userFollowingContents', 'community'],
      },
    );
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
        return ResponseFormatService.responseNotFound(
          [],
          'Invalid Entity or Community Id',
        );
      }
      body.isDeleted = false;
      body.createdBy = req['userData'].id;
      body.updatedBy = req['userData'].id;
      req['userData']['community'] = body.community;
      body.entityType = entity[0];
      body.community = community[0];
      response = await this.followingContentService.addFollowingContent(body);
    }

    // const userFollowingContentsRepo = getRepository(UserFollowingContents);
    // const createdData = await userFollowingContentsRepo.create({
    //   userId: req['userData'].id,
    //   followingContentId: response['id'],
    // });
    // await userFollowingContentsRepo.save(createdData);
    await this.followingContentService.addUserFollowingContent(
      req['userData'],
      response['id'],
    );

    return ResponseFormatService.responseOk(
      response,
      'FollowingContent Added Successfully',
    );
  }

  @Get()
  async getAllFollowingContents(): Promise<ResponseFormat> {
    const options = {};
    const response = await this.followingContentService.getFollowingContents(
      options,
    );
    return ResponseFormatService.responseOk(response, 'All');
  }

  // TODO Change user id type to int after updating DB
  /**
   * Get user's all types of follows
   * @returns {array} List of all user specific follows
   */
  @Get('user/all')
  async getUserBookmark(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const follows = await this.followingContentService.getUserFollows(
      queryParams.userId || req['userData'].id,
      req.body.community,
    );
    return ResponseFormatService.responseOk(follows, 'Users Follows');
  }

  /**
   * Get user folllow by entities
   * @param {string} entityObjectId Entity id to filter out follows list
   * @returns {array} List of entity specific follows
   */
  @Get('entity/:entityType')
  async getEntityBookmark(
    @Req() req: Request,
    @Query() queryParams,
    @Param('entityType') entityTypeId,
  ): Promise<ResponseFormat> {
    const follows = await this.followingContentService.getUserFollowsByEntityType(
      {
        userId: queryParams.userId || req['userData'].id,
        entityTypeId: entityTypeId,
      },
    );
    return ResponseFormatService.responseOk(
      follows,
      'Entity wise Follows against user',
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
    const bookmarks = await this.followingContentService.getFollowingCounts(
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
  async getFollowingContent(@Param('id') id: string): Promise<ResponseFormat> {
    const response = await this.followingContentService.getFollowingContents({
      id: id,
    });
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get('user/followers')
  async getUsersFollowers(
    @Query() queryParams: GetUserFollowersDto,
  ): Promise<ResponseFormat> {
    const userEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.USER,
    );
    const checkIfFollowingContentIsForUser = await this.followingContentService.getFollowingContents(
      {
        where: {
          entityObjectId: queryParams.userId,
          community: queryParams.communityId,
          entityType: userEntityType.id,
        },
      },
    ); // Should be only one for a single user for each community
    if (!checkIfFollowingContentIsForUser.length) {
      return ResponseFormatService.responseOk([], 'No Followers Available');
    }
    const userFollowingContentsRepo = getRepository(UserFollowingContents);
    const userFollowingContentData = await userFollowingContentsRepo.find({
      where: {
        followingContentId: checkIfFollowingContentIsForUser[0].id,
      },
      relations: ['followingContent'],
    });
    if (!userFollowingContentData.length) {
      return ResponseFormatService.responseOk([], 'No Followers Available');
    }
    const userFollowers = [];
    for (const iterator of userFollowingContentData) {
      const tempUserData = await this.userService.getUsers({
        where: { id: iterator.userId },
      });
      userFollowers.push(tempUserData[0]);
    }
    checkIfFollowingContentIsForUser[0]['followerData'] = userFollowers;
    return ResponseFormatService.responseOk(
      checkIfFollowingContentIsForUser,
      'User Followers',
    );
  }

  @Get('user/:id')
  async getUserFollowingContent(
    @Param('id') id: string,
    @Query('dummy') dummy: number,
  ): Promise<ResponseFormat> {
    const userFollowingContentsRepo = getRepository(UserFollowingContents);
    let userData = await userFollowingContentsRepo.find({
      where: {
        userId: id,
      },
      relations: ['followingContent', 'followingContent.entityType'],
    });
    const counts = {
      users: userData.length,
      opportunity: parseInt('' + dummy),
      insight: parseInt('' + dummy),
      challenges: parseInt('' + dummy),
    };
    counts['all'] =
      counts.users + counts.opportunity + counts.insight + counts.challenges;
    if (userData.length) {
      for (const iterator of userData) {
        iterator[
          'entityObject'
        ] = await EntityMetaService.getEntityObjectByEntityType(
          iterator.followingContent.entityType.abbreviation,
          iterator.followingContent.entityObjectId,
        );
      }
    }
    /* Adding Dummy Objects For Insights and Opportunities */
    const finalDataWithDummy = [];
    if (dummy >= 1) {
      for (let index = 0; index < dummy; index++) {
        const newObject = { ...DUMMY_DATA_OBJECTS.followingInsight };
        newObject.entityObject = {
          ...DUMMY_DATA_OBJECTS.followingInsight.entityObject,
        };

        const newOpportunityObject = {
          ...DUMMY_DATA_OBJECTS.followingOpportunity,
        };
        newOpportunityObject.entityObject = {
          ...DUMMY_DATA_OBJECTS.followingOpportunity.entityObject,
        };
        const newChallengeObject = {
          ...DUMMY_DATA_OBJECTS.followingChallenge,
        };
        newChallengeObject.entityObject = {
          ...DUMMY_DATA_OBJECTS.followingChallenge.entityObject,
        };

        newObject.entityObject.title =
          newObject.entityObject.title + '' + index;
        newOpportunityObject.entityObject.title =
          newOpportunityObject.entityObject.title + '' + index;
        newChallengeObject.entityObject.title =
          newChallengeObject.entityObject.title + '' + index;
        finalDataWithDummy.push(newObject);
        finalDataWithDummy.push(newOpportunityObject);
        finalDataWithDummy.push(newChallengeObject);
      }
      userData = [...userData, ...finalDataWithDummy];
    }

    /* Adding Dummy Objects For Insights and Opportunities */
    const fialData = {
      userFollowingData: userData,
      userFollowingCount: counts,
    };
    return ResponseFormatService.responseOk(fialData, 'All');
  }

  @Patch(':id')
  async updateFollowingContent(
    @Param('id') id,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.followingContentService.updateFollowingContent(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  // @Delete('user/:id')
  // async removeUserFollowingContent(@Param('id') id): Promise<ResponseFormat> {
  //   const userFollowingContentsRepo = getRepository(UserFollowingContents);
  //   const deleteData = await userFollowingContentsRepo.delete({ userId: id });
  //   return ResponseFormatService.responseOk(deleteData, '');
  // }

  @Delete('user/:id/follow/:followId')
  async removeUserFollow(
    @Param('id') id,
    @Param('followId') followId,
  ): Promise<ResponseFormat> {
    const userFollowingContents = getRepository(UserFollowingContents);
    const deleteData = await userFollowingContents.delete({
      userId: id,
      followingContentId: followId,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }

  @Delete(':id')
  async removeFollowingContent(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.followingContentService.deleteFollowingContent(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
