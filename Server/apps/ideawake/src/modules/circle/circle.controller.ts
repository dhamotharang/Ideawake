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
import { getRepository, getConnection, In } from 'typeorm';

import { CircleService } from './circle.service';
import { UserCircleService } from '../user/userCircle.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  AddCircleDto,
  EditCircleDto,
  AddUsersInCircleDto,
  SearchCircleDto,
  DeleteUsersInCircleDto,
  DeleteUserCircles,
  SearchCommunityCirclesDto,
} from './dto';
import { Request } from 'express';
import { UserCircles } from '../user/user.circles.entity';
import { UtilsService } from '../../providers/utils.service';
import * as _ from 'lodash';
import { UserService } from '../user/user.service';
import { InviteService } from '../invite/invite.service';

@Controller('circle')
export class CircleController {
  constructor(
    private readonly circleService: CircleService,
    private readonly userCircleService: UserCircleService,
    private readonly userService: UserService,
    private readonly inviteService: InviteService,
  ) {}

  @Post()
  async addCircle(
    @Body() body: AddCircleDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const finalObject = [];
    const groupNames = _.map(body.groups, 'name');
    const dataDuplicate = await this.circleService.getCircles({
      where: { name: In(groupNames), community: body.communityId },
    });
    if (dataDuplicate.length) {
      return ResponseFormatService.responseUnprocessableEntity(
        [],
        'Group(s) name duplicate error',
      );
    }
    for (const iterator of body.groups) {
      finalObject.push({
        ...iterator,
        cratedBy: req['userData'].id,
        updatedBy: req['userData'].id,
        pinnedToShortcut: body.pinToShortcut,
        community: body.communityId,
        isDeleted: false,
        user: req['userData'].id,
      });
    }
    const response = await this.circleService.addCircle(finalObject);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Post('users')
  async addUserInCircle(
    @Body() body: AddUsersInCircleDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const userIds = body.users.map(user => user.userId);

    const users = await this.userService.getUsersWithFilters({
      userIds,
      communityId: req['userData'].currentCommunity,
    });

    let savedResponse = {};
    if (users.length) {
      const userCirclesByUser = _.groupBy(body.users, 'userId');

      const userCirclesToAdd = _.flatten(
        users.map(user => {
          const userCircles = _.get(userCirclesByUser, user.id);
          return userCircles.map(userCircle => ({
            userId: user.id,
            circleId: parseInt(userCircle.circleId),
            role: userCircle.role,
          }));
        }),
      );
      savedResponse = await this.userCircleService.addUserCircle(
        userCirclesToAdd,
      );

      // Add the selected users' circles in pending invites.
      this.inviteService.addCircleToPendingInvite(
        users,
        body.users,
        req['userData'].currentCommunity,
      );
    }

    return ResponseFormatService.responseOk(
      savedResponse,
      'Created Successfully',
    );
  }

  @Get()
  async getAllCircles(@Query() queryParams: {}): Promise<ResponseFormat> {
    const options = {
      relations: ['circleUsers', 'circleUsers.user', 'community'],
      where: queryParams,
    };
    const themes = await this.circleService.getCircles(options);
    return ResponseFormatService.responseOk(themes, 'All');
  }

  @Get('search')
  async searchCircles(
    @Query() queryParams: SearchCircleDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const data = await this.circleService.searchCircles({
      communityId: req['userData'].currentCommunity,
      isDeleted: queryParams.showArchived === 'true',
      ...(queryParams.searchByName && { searchText: queryParams.searchByName }),
      ...(queryParams.limit && { take: parseInt(queryParams.limit) }),
      ...(queryParams.offset && { skip: parseInt(queryParams.offset) }),
      ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
      ...(queryParams.sortType && {
        sortType: queryParams.sortType === 'desc' ? 'DESC' : 'ASC',
      }),
    });

    if (!_.get(data[0], 'length')) {
      return ResponseFormatService.responseOk([], 'No Circles Available');
    }

    const circleIds = _.map(data[0], 'id');

    // Get active users count for circles.
    const circleUsersCounts = await this.userCircleService.getCircleUsersCount({
      circleIds,
      isUserDeleted: false,
      communityId: req['userData'].currentCommunity,
    });
    const usersCountByCircle = _.keyBy(circleUsersCounts, 'circleId');

    // Get child circles count.
    const childrenCount = await this.circleService.getChildCirclesCount({
      circleIds,
    });
    const childrenCountByCircle = _.keyBy(childrenCount, 'circleId');

    // Get circle invites for calculating signup percentage.
    const circleInvites = await getConnection().query(
      `SELECT invite_accepted, circles FROM invite WHERE ARRAY[${data[0].map(
        group => `'${group.id}'`,
      )}] && circles;`,
    );

    const finalData = [];
    for (const group of data[0]) {
      const invites = circleInvites.filter(inv =>
        _.get(inv, 'circles', []).includes(group.id.toString()),
      );
      const signupPercentage = UtilsService.getCommunitySignupRate(invites);

      finalData.push({
        ...group,
        userCount: _.get(usersCountByCircle, `${group.id}.count`, 0),
        numberOfChild: _.get(childrenCountByCircle, `${group.id}.count`, 0),
        signupPercentage: signupPercentage,
      });
    }

    return ResponseFormatService.responseOk(
      { data: finalData, count: data[1] },
      'All Circles Data',
    );
  }

  @Post('search-community-circles')
  async searchCommuntyCircles(
    @Body() body: SearchCommunityCirclesDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const data = await this.circleService.searchCircles({
      communityId: req['userData'].currentCommunity,
      searchText: body.searchText,
      isDeleted: body.isDeleted || false,
      ...(body.take && { take: body.take }),
      ...(body.skip && { skip: body.skip }),
      sortBy: body.sortBy,
      sortType: body.sortType,
      ...(_.get(body, 'excludedIds.length') && {
        excludedIds: body.excludedIds,
      }),
    });
    let groupsFound = data[0];

    let extraCircles = [];
    if (_.get(body, 'extraCircleIds.length')) {
      extraCircles = (await this.circleService.searchCircles({
        communityId: req['userData'].currentCommunity,
        isDeleted: body.isDeleted || false,
        sortBy: body.sortBy,
        sortType: body.sortType,
        ...(_.get(body, 'extraCircleIds.length') && {
          circleIds: body.extraCircleIds,
        }),
      }))[0];
    }

    const allCircleIds = _.uniq(
      _.map(groupsFound, 'id').concat(_.map(extraCircles, 'id')),
    );

    // Get active users count for circles.
    let usersCountByCircle = {};
    if (_.get(allCircleIds, 'length')) {
      const circleUsersCounts = await this.userCircleService.getCircleUsersCount(
        {
          circleIds: allCircleIds,
          isUserDeleted: false,
          communityId: req['userData'].currentCommunity,
        },
      );
      usersCountByCircle = _.keyBy(circleUsersCounts, 'circleId');
    }

    [groupsFound, extraCircles] = [groupsFound, extraCircles].map(groups =>
      groups.map(group => ({
        ...group,
        userCount: _.get(usersCountByCircle, `${group.id}.count`, 0),
      })),
    );

    return ResponseFormatService.responseOk(
      { data: groupsFound, count: data[1], extraCircles },
      'All Circles Data',
    );
  }

  @Get('count')
  async countCircles(@Req() req: Request): Promise<ResponseFormat> {
    const [active, archived] = await Promise.all([
      this.circleService.getCircleCount(
        false,
        req['userData'].currentCommunity,
      ),
      this.circleService.getCircleCount(true, req['userData'].currentCommunity),
    ]);

    return ResponseFormatService.responseOk(
      { active, archived, total: archived + active },
      'Circles Counts',
    );
  }

  @Get(':id')
  async getCircle(@Param('id') circleId: string): Promise<ResponseFormat> {
    const theme = await this.circleService.getCircles({ id: circleId });
    return ResponseFormatService.responseOk(theme, 'All');
  }

  @Patch(':id')
  async updateCircle(
    @Param('id') circleId: string,
    @Body() body: EditCircleDto,
  ): Promise<ResponseFormat> {
    const updateData = await this.circleService.updateCircle(
      { id: circleId },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete('users')
  async deleteUserInCircle(
    @Body() body: DeleteUsersInCircleDto,
  ): Promise<ResponseFormat> {
    const userCirclesRepository = getRepository(UserCircles);
    const deletedData = await userCirclesRepository.delete({
      userId: In(body.users),
      circleId: body.circleId,
    });
    return ResponseFormatService.responseOk(
      deletedData,
      'Deleted Successfully',
    );
  }

  @Delete('user-circles')
  async deleteUserCircles(
    @Body() body: DeleteUserCircles,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const user = _.head(
      await this.userService.getUsersWithFilters({
        userIds: [body.user],
        communityId: req['userData'].currentCommunity,
      }),
    );
    let deletedData = {};

    if (user) {
      const userCirclesRepository = getRepository(UserCircles);
      deletedData = await userCirclesRepository.delete({
        userId: body.user,
        circleId: In(body.circleIds),
      });

      // Remove the selected user's circle from invite.
      const invite = await this.inviteService.getOneInvite({
        where: {
          email: user.email,
          communityId: req['userData'].currentCommunity,
          isDeleted: false,
          inviteAccepted: false,
        },
      });
      if (invite) {
        const remainingCircles = _.difference(
          invite.circles || [],
          body.circleIds,
        );
        this.inviteService.updateInvite(
          { id: invite.id },
          { circles: remainingCircles },
        );
      }
    }

    return ResponseFormatService.responseOk(
      deletedData,
      'Deleted Successfully',
    );
  }

  @Delete(':id')
  async removeCircle(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.circleService.updateCircle(
      { id: id },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(
      deleteResponse,
      'Group Archived Successfully',
    );
  }
}
