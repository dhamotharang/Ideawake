import { createObjectCsvStringifier as createCsvWriter } from 'csv-writer';
import { Request } from 'express';
import * as _ from 'lodash';
import { getRepository, In } from 'typeorm';

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  PERMISSIONS_MAP,
  ROLE_ABBREVIATIONS,
} from '../../common/constants/constants';
import { RoleActorTypes } from '../../enum';
import { RoleLevelEnum } from '../../enum/role-level.enum';
// import { RolesEnum } from '../../enum/roles.enum';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { UtilsService } from '../../providers/utils.service';
import { AuthService } from '../../modules/auth/auth.service';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { MailService } from '../../shared/services/mailer.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { CircleEntity } from '../circle/circle.entity';
import { CircleService } from '../circle/circle.service';
import { CommentService } from '../comment/comment.service';
import { CommunityService } from '../community/community.service';
import { EmailTemplateService } from '../email/email-template.service';
import { FollowingContentService } from '../followingContent/followingContent.service';
import { InviteGateway } from '../invite/invite.gateway';
import { InviteService } from '../invite/invite.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { RoleService } from '../role/role.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { TagService } from '../tag/tag.service';
import { TenantService } from '../tenant/tenant.service';
import {
  GetProfileImageUploadUrl,
  MultipleUserDto,
  SearchUserByCircleDto,
  SearchExportUserByCommunityDto,
  UserDuplicateSearchDto,
  UserGroupDto,
  UserRegisterDto,
  SearchCommunityUsersDto,
} from './dto';
import { EditUserRole } from './dto/EditUserRole';
import { UserCircles } from './user.circles.entity';
import { UserService } from './user.service';
import { UserCommCommunities } from './userCommunityCommunities.entity';
import { GetUniqueUsersCountDto } from './dto/GetUniqueUsersCountDto';
import { uniqBy } from 'lodash';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { PERMISSIONS_KEYS } from '../../common/constants/constants';
import { PermissionsCondition } from '../../enum/permissions-condition.enum';
import { RequestPermissionsKey } from '../../enum/request-permissions-key.enum';
import { VoteService } from '../vote/vote.service';
import { UserActionPointService } from '../userActionPoint/userActionPoint.service';
import { parse } from 'tldts';
import { BulkImportUsersDto } from './dto/BulkImportUsersDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserCircleService } from './userCircle.service';
import { ArchiveUserDto } from './dto/ArchiveUser';

// import FileType from 'file-type';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    public readonly authService: AuthService,
    public readonly communityService: CommunityService,
    public readonly tenantService: TenantService,
    public readonly mailService: MailService,
    public readonly inviteService: InviteService,
    public readonly inviteGateway: InviteGateway,
    public readonly emailTemplateService: EmailTemplateService,
    public readonly tagService: TagService,
    private readonly awsS3Service: AwsS3Service,
    private readonly opportunityService: OpportunityService,
    private readonly commentService: CommentService,
    private readonly followingContentService: FollowingContentService,
    private readonly circleService: CircleService,
    private readonly userCircleService: UserCircleService,
    public readonly roleActorService: RoleActorsService,
    public readonly roleService: RoleService,
    public readonly voteService: VoteService,
    public readonly userActionPointService: UserActionPointService,
  ) {}

  @Post()
  async addUser(@Body() body: UserRegisterDto): Promise<ResponseFormat> {
    body.email = body.email.toLowerCase();
    const response = await this.userService.addUser(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Post('import-bulk')
  async bulkImportUsers(
    @Body() body: BulkImportUsersDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await Promise.all(
      body.users.map(user =>
        this.userService.addUserWithData({
          user,
          community: req['userData'].currentCommunity,
        }),
      ),
    );
    return ResponseFormatService.responseOk(
      response,
      'Users Imported Successfully',
    );
  }

  @Get('get-current-user-data')
  async refreshUserToken(@Req() req: Request): Promise<ResponseFormat> {
    const userFullData = await this.userService.getUsers({
      relations: [
        'userCommunities',
        'userCommunities.community',
        'opportunities',
        'opportunities.opportunityType',
        'profileImage',
      ],
      where: {
        email: req['userData'].email,
      },
    });
    /**
     * Updating Object Structure for front end
     */
    const userCommunitiesTemp = userFullData[0].userCommunities.map(
      userCom => userCom.community,
    );
    if (userFullData[0].skills && userFullData[0].skills.length) {
      userFullData[0]['skillsData'] = await this.tagService.getTags({
        where: { id: In(userFullData[0].skills) },
      });
    }
    userFullData[0]['communities'] = userCommunitiesTemp;

    // Fetching User communities roles
    userFullData[0]['roles'] = await this.roleActorService.getRoleActors({
      where: {
        entityObjectId: null,
        entityType: null,
        actorId: userFullData[0].id,
        actorType: RoleActorTypes.USER,
        community: In(
          userFullData[0].userCommunities.map(
            userCommunity => userCommunity.communityId,
          ),
        ),
      },
      relations: ['role'],
    });

    delete userFullData[0].userCommunities;
    /**
     * Updating Object Structure for front end
     */
    return ResponseFormatService.responseOk(
      userFullData,
      'Logged In User Data',
    );
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @Query() queryParams: UserDuplicateSearchDto,
  ): Promise<ResponseFormat> {
    const newqueryParams = { where: {}, relations: {} };
    newqueryParams.where = JSON.parse(JSON.stringify(queryParams));
    newqueryParams.relations = ['userCommunities', 'userCommunities.community'];
    const data = await this.userService.getUsers(newqueryParams);
    return ResponseFormatService.responseOk(
      { data: data[0], count: data[1] },
      'All',
    );
  }
  /**
   *
   * Get user data list with meta data
   * @param {object} queryParams
   * @return List of users
   */
  @Get()
  async getAllUsers(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const userData = {};
    const options = {
      where: {},
      relations: ['profileImage', 'userCommunities'],
    };
    let follows = [] || {};
    if (_.get(queryParams, 'id') && typeof queryParams.id === 'object') {
      //Get multiple users list
      options.where['id'] = In(queryParams.id);

      //Get user followers
      follows = await this.followingContentService.getUserFollowByEntityObjectIds(
        queryParams.id,
        req['userData'].id,
      );
    }
    userData['users'] = await this.userService.getUsers(options);

    //Extract Skills Id's
    let skills = [];
    _.map(userData['users'], user => {
      const followContent = _.find(follows, ['entityObjectId', user.id]);
      if (followContent) {
        user.following = true;
        user.followId = _.get(followContent, 'id');
      }
      if (!_.isEmpty(user.skills)) {
        skills = [...user.skills];
      }
    });

    //Get Skills Defination
    if (!_.isEmpty(skills)) {
      const tags = {};
      const tagsData = await this.tagService.getTags({
        select: ['id', 'name'],
        where: {
          id: In(skills),
        },
      });
      _.map(tagsData, val => {
        tags[val.id] = val.name;
      });
      userData['tags'] = tags;
    }

    return ResponseFormatService.responseOk(userData, 'List Of Users');
  }

  @Post('get-users-profile-image')
  async getMultipleUsers(@Body() body: MultipleUserDto) {
    const userData = await this.userService.getUsers({
      where: { id: In(body.userIds) },
      relations: ['profileImage'],
    });
    const finalData = {};
    _.map(userData, val => {
      finalData[val.id] = val.profileImage.url;
    });
    return ResponseFormatService.responseOk(finalData, '');
  }

  @Post('get-users-data')
  async getMultipleUsersData(@Body() body: MultipleUserDto) {
    const userData = await this.userService.getUsers({
      where: { id: In(body.userIds) },
    });
    const finalData = {};
    _.map(userData, val => {
      finalData[val.id] = val;
    });
    return ResponseFormatService.responseOk(finalData, '');
  }

  @Get('groups')
  async getAllUsersWithGroups(
    @Query() queryParams: UserGroupDto,
  ): Promise<ResponseFormat> {
    const groupData = await this.circleService.getCircles({
      where: { community: queryParams.community },
    });
    const userCirclesRepository = getRepository(UserCircles);
    const circleUsersCount = [];
    _.map(groupData, (val: CircleEntity) => {
      circleUsersCount.push(
        userCirclesRepository.find({
          where: { circleId: val.id },
        }),
      );
    });

    let userGroupData = await Promise.all(circleUsersCount);
    userGroupData = _.flatMap(userGroupData);
    _.map(groupData, (val: CircleEntity) => {
      val['type'] = 'group';
      val['userCount'] = _.filter(userGroupData, function(o: UserCircles) {
        return o.circleId == val.id;
      }).length;
    });

    const userData = await this.userService.getUsersWithCommunity({
      communityId: queryParams.community,
      isDeleted: false,
    });

    _.map(userData, user => {
      user['name'] = user.firstName + ' ' + user.lastName;
      user['type'] = 'user';
    });

    const finalData = _.orderBy(
      _.flatMap([userData, groupData]),
      ['name'],
      ['asc'],
    );

    return ResponseFormatService.responseOk(
      finalData,
      'List Of Users With Groups',
    );
  }
  @Get('get-user-counts')
  async getUserCounts(@Query()
  queryParams: {
    userIds: [];
    entityType: any;
  }): Promise<ResponseFormat> {
    const groupedUserDataFinal = {};
    const groupedUserDataFinalComment = {};
    const groupedUserDataFinalVote = {};
    /*  */
    const options = {
      relations: ['user'],
      where: {
        user: In(queryParams.userIds),
        // opportunityType: 'idea',
        isDeleted: false,
      },
    };

    const ideaDadata = await this.opportunityService.getOpportunities(options);
    const groupedIdeaDadata = _.groupBy(ideaDadata, 'user.id');

    for (const iterator in groupedIdeaDadata) {
      groupedUserDataFinal[iterator] = groupedIdeaDadata[iterator].length;
    }
    /*  */
    const optionComments = {
      relations: ['user'],
      where: {
        user: In(queryParams.userIds),
        entityType: queryParams.entityType,
      },
    };

    const commentData = await this.commentService.getComments(optionComments);
    const groupedCommentData = _.groupBy(commentData, 'user.id');

    for (const iterator in groupedCommentData) {
      groupedUserDataFinalComment[iterator] =
        groupedCommentData[iterator].length;
    }
    /*  */
    /*  */
    const optionVotes = {
      relations: ['user'],
      where: {
        user: In(queryParams.userIds),
        entityType: queryParams.entityType,
      },
    };

    const voteData = await this.voteService.getAllVote(optionVotes);
    const groupedvoteDataData = _.groupBy(voteData, 'user.id');

    for (const iterator in groupedvoteDataData) {
      groupedUserDataFinalVote[iterator] = groupedvoteDataData[iterator].length;
    }
    /*  */
    const followDataFinal = {};
    const followData = await this.followingContentService.getFollowingContents({
      relations: ['userFollowingContents'],
      where: {
        entityObjectId: In(queryParams.userIds),
      },
    });
    for (const iterator of followData) {
      followDataFinal[iterator.entityObjectId] =
        iterator.userFollowingContents.length;
    }

    return ResponseFormatService.responseOk(
      {
        ideas: groupedUserDataFinal,
        comment: groupedUserDataFinalComment,
        vote: groupedUserDataFinalVote,
        follow: followDataFinal,
      },
      'All Users Counts',
    );
  }
  @Get('get-user-detail-counts')
  async getUserDetailCounts(@Query()
  queryParams: {
    userIds: [];
    community: any;
  }): Promise<ResponseFormat> {
    const groupedUserDataFinal = {};
    const groupedUserDataFinalComment = {};
    const groupedUserDataFinalVote = {};
    const groupedUserDataFinalPoints = {};
    const groupedUserDataFinalRank = {};

    const currentCommunity = await this.communityService.getOneCommunity({
      where: { id: queryParams.community },
      relations: ['tenant'],
    });
    const communities = await this.communityService.getTenantCommunities({
      tenant: currentCommunity.tenant.id,
    });

    const mapData = [];
    const anotherMapData = [];

    communities.forEach(community => {
      queryParams.userIds.forEach(userId => {
        mapData.push({
          user: userId,
          community: community.id,
          isDeleted: false,
        });
        anotherMapData.push({
          user: userId,
          community: community.id,
        });
      });
    });

    /*  */
    const options = {
      relations: ['user'],
      where: mapData,
    };

    const ideaDadata = await this.opportunityService.getOpportunities(options);
    const groupedIdeaDadata = _.groupBy(ideaDadata, 'user.id');

    for (const iterator in groupedIdeaDadata) {
      groupedUserDataFinal[iterator] = groupedIdeaDadata[iterator].length;
    }

    /*  */
    const optionComments = {
      relations: ['user'],
      where: mapData,
    };

    const commentData = await this.commentService.getComments(optionComments);
    const groupedCommentData = _.groupBy(commentData, 'user.id');

    for (const iterator in groupedCommentData) {
      groupedUserDataFinalComment[iterator] =
        groupedCommentData[iterator].length;
    }
    /*  */
    /*  */
    const optionPoints = {
      relations: ['user'],
      where: anotherMapData,
    };

    const pointsData = await this.userActionPointService.getUserActionPoints(
      optionPoints,
    );
    const groupedPointsData = _.groupBy(pointsData, 'user.id');

    for (const iterator in groupedPointsData) {
      groupedUserDataFinalPoints[iterator] = _.sumBy(
        groupedPointsData[iterator],
        'experiencePoint',
      );
    }
    /*  */
    /*  */
    const optionVotes = {
      relations: ['user'],
      where: anotherMapData,
    };

    const voteData = await this.voteService.getAllVote(optionVotes);

    const groupedVoteData = _.groupBy(voteData, 'user.id');

    for (const iterator in groupedVoteData) {
      groupedUserDataFinalVote[iterator] = groupedVoteData[iterator].length;
    }
    /*  */

    const communityActionPoints = await this.userActionPointService.getUserActionPointsProcess(
      {
        community: queryParams.community,
        frequency: 'month',
      },
    );
    const communityActionPointsGrouped = _.groupBy(communityActionPoints, 'id');
    for (const iterator in communityActionPointsGrouped) {
      groupedUserDataFinalRank[iterator] = _.head(
        communityActionPointsGrouped[iterator],
      )['rank'];
    }

    return ResponseFormatService.responseOk(
      {
        rank: groupedUserDataFinalRank,
        points: groupedUserDataFinalPoints,
        ideas: groupedUserDataFinal,
        comment: groupedUserDataFinalComment,
        vote: groupedUserDataFinalVote,
      },
      'All Users Counts',
    );
  }
  @Get('upload-avatar')
  async getAllUsersAVA(): Promise<ResponseFormat> {
    const content = await UtilsService.getUserAvatar(
      'zeeshan',
      'altaf',
      100,
      'D3F9F1',
      '898989',
    );
    const avatarUrl = await this.awsS3Service.uploadImage(
      {
        buffer: content,
        mimetype: 'image/png',
      },
      'attachments/users/',
    );

    return ResponseFormatService.responseOk(avatarUrl, 'All Users');
  }

  @Get('search')
  async searchUsersByCircle(
    @Query() queryParams: SearchUserByCircleDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      const userData = await this.userService.searchUsersInCircle({
        communityId: req['userData'].currentCommunity,
        circleId: parseInt(queryParams.circleId),
        showArcived: queryParams.showArchived
          ? queryParams.showArchived
          : 'false',
        searchKeys: {
          name: queryParams.searchByName ? queryParams.searchByName : '',
          userName: queryParams.searchByUsername
            ? queryParams.searchByUsername
            : '',
          email: queryParams.searchByEmail ? queryParams.searchByEmail : '',
        },
        ...(queryParams.exportData !== 'true' && {
          joinProfileImage: true,
          take: parseInt(queryParams.limit),
          skip: parseInt(queryParams.offset),
        }),
        ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
        ...(queryParams.sortType && {
          sortType: queryParams.sortType === 'desc' ? 'DESC' : 'ASC',
        }),
        ...(queryParams.hasOwnProperty('isUserPending') && {
          isUserPending: queryParams.isUserPending,
        }),
      });
      const usersFound = userData[0];

      if (!usersFound.length) {
        return ResponseFormatService.responseOk([], 'No Users Available');
      }

      // Fetching all users' roles.
      const allUserRoleActors = await this.roleActorService.getRoleActors({
        where: {
          entityObjectId: null,
          entityType: null,
          actorId: In(usersFound.map(user => user.id)),
          actorType: RoleActorTypes.USER,
          community: req['userData'].currentCommunity,
        },
        relations: ['role'],
      });
      const allUserRoleActorsGrouped = _.groupBy(allUserRoleActors, 'actorId');

      // Getting users' groups.
      const usersGroups = await this.userCircleService.getCommunityUserCircles({
        communityId: req['userData'].currentCommunity,
        userIds: usersFound.map(user => user.id),
        // isCircleDeleted: false,
      });
      const groupsByUserId = _.groupBy(usersGroups, 'userId');

      const finalData = [];
      for (const user of usersFound) {
        finalData.push({
          ...user,
          role:
            allUserRoleActorsGrouped && allUserRoleActorsGrouped[user.id]
              ? _.head(allUserRoleActorsGrouped[user.id]).role
              : {},
          fullName: user.firstName + ' ' + user.lastName,
          userCircles: _.get(groupsByUserId, user.id, []),
        });
      }

      if (queryParams.exportData === 'true') {
        const csvWriter = createCsvWriter({
          header: [
            { id: 'fullName', title: 'Name' },
            { id: 'userName', title: 'Username' },
            { id: 'role', title: 'Role' },
            { id: 'email', title: 'Email:' },
            { id: 'userCircles', title: 'Groups' },
            { id: 'isDeleted', title: 'Archived?' },
          ],
        });
        const dataExport = [];
        (finalData || []).forEach(user => {
          dataExport.push({
            fullName: user.fullName,
            userName: user.userName,
            role: _.get(user, 'role.role.title', 'User'),
            email: user.email,
            userCircles: user.userCircles.map(e => e.circle.name),
            isDeleted: user.isDeleted ? 'Yes' : 'No',
          });
        });

        const data = {
          data: csvWriter.stringifyRecords(dataExport),
          headers: csvWriter.getHeaderString(),
        };

        return ResponseFormatService.responseOk(data, 'Exported Successfully');
      }

      return ResponseFormatService.responseOk(
        { data: finalData, count: userData[1] },
        'Group Users',
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('community/search')
  async searchAndExportByCommunities(
    @Query() queryParams: SearchExportUserByCommunityDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      const userData = await this.userService.searchCommunityUsers({
        communityId: req['userData'].currentCommunity,
        ...(queryParams.hasOwnProperty('showArchived') && {
          isUserDeleted: queryParams.showArchived,
        }),
        searchText: queryParams.searchText,
        joinProfileImage: !queryParams.exportData,
        ...(queryParams.take &&
          !queryParams.exportData && { take: parseInt(queryParams.take) }),
        ...(queryParams.skip &&
          !queryParams.exportData && { skip: parseInt(queryParams.skip) }),
        ...(queryParams.hasOwnProperty('isUserPending') && {
          isUserPending: queryParams.isUserPending,
        }),
      });
      const usersFound = userData[0];

      if (!usersFound.length) {
        return ResponseFormatService.responseOk([], 'No Users Available');
      }

      const allUserRoles = await this.roleActorService.getRoleActors({
        where: {
          entityObjectId: null,
          entityType: null,
          actorId: In(usersFound.map(user => user.id)),
          actorType: RoleActorTypes.USER,
          community: req['userData'].currentCommunity,
        },
        relations: ['role'],
      });
      const allUserRolesGrouped = _.groupBy(allUserRoles, 'actorId');

      // Getting users' active groups.
      const usersGroups = await this.userCircleService.getCommunityUserCircles({
        communityId: req['userData'].currentCommunity,
        userIds: usersFound.map(user => user.id),
        isCircleDeleted: false,
      });
      const groupsByUserId = _.groupBy(usersGroups, 'userId');

      let finalData = [];
      for (const user of usersFound) {
        finalData.push({
          ...user,
          role:
            allUserRolesGrouped && allUserRolesGrouped[user.id]
              ? _.head(allUserRolesGrouped[user.id])
              : {},
          fullName: user.firstName + ' ' + user.lastName,
          userCircles: _.get(groupsByUserId, user.id, []),
        });
      }

      if (queryParams.sortBy && queryParams.sortType) {
        const dataSorted = _.orderBy(
          finalData,
          [queryParams.sortBy],
          [queryParams.sortType === 'asc' ? 'asc' : 'desc'],
        );
        finalData = dataSorted;
      }

      if (queryParams.exportData) {
        const csvWriter = createCsvWriter({
          header: [
            { id: 'fullName', title: 'Name' },
            { id: 'userName', title: 'Username' },
            { id: 'role', title: 'Role' },
            { id: 'email', title: 'Email' },
            { id: 'userCircles', title: 'Groups' },
            { id: 'isDeleted', title: 'Archived?' },
          ],
        });
        const dataExport = [];
        (finalData || []).forEach(user => {
          dataExport.push({
            fullName: user.fullName,
            userName: user.userName,
            role: _.get(user, 'role.role.title', 'User'),
            email: user.email,
            userCircles: user.userCircles.map(e => e.circle.name),
            isDeleted: user.isDeleted ? 'Yes' : 'No',
          });
        });

        const data = {
          data: csvWriter.stringifyRecords(dataExport),
          headers: csvWriter.getHeaderString(),
        };

        return ResponseFormatService.responseOk(data, 'Exported Successfully');
      }

      return ResponseFormatService.responseOk(
        { data: finalData, count: userData[1] },
        'Community Users',
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('search-community-users')
  async searchCommunityUsers(
    @Body() body: SearchCommunityUsersDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const userData = await this.userService.searchCommunityUsers({
      communityId: req['userData'].currentCommunity,
      isUserDeleted: body.isUserDeleted || false,
      searchText: body.searchText,
      joinProfileImage: true,
      ...(body.take && { take: body.take }),
      ...(body.skip && { skip: body.skip }),
      ...(body.hasOwnProperty('isUserPending') && {
        isUserPending: body.isUserPending,
      }),
      sortBy: body.sortBy,
      sortType: body.sortType,
      ...(_.get(body, 'excludedIds.length') && {
        excludedIds: body.excludedIds,
      }),
    });
    let usersFound = userData[0];

    let extraUsers = [];
    if (_.get(body, 'extraUserIds.length')) {
      extraUsers = (await this.userService.searchCommunityUsers({
        communityId: req['userData'].currentCommunity,
        isUserDeleted: body.isUserDeleted || false,
        userIds: body.extraUserIds,
        sortBy: body.sortBy,
        sortType: body.sortType,
      }))[0];
    }

    let roleActorsByUser = {};
    if (usersFound.length || extraUsers.length) {
      const actorIds = _.uniq(
        usersFound.map(user => user.id).concat(extraUsers.map(user => user.id)),
      );
      const roleActors = await this.roleActorService.getRoleActors({
        where: {
          entityObjectId: null,
          entityType: null,
          actorId: In(actorIds),
          actorType: RoleActorTypes.USER,
          community: req['userData'].currentCommunity,
        },
        relations: ['role'],
      });
      roleActorsByUser = _.keyBy(roleActors, 'actorId');
    }

    [usersFound, extraUsers] = [usersFound, extraUsers].map(users =>
      users.map(user => ({
        ...user,
        role: _.get(roleActorsByUser, `${user.id}.role`) || {},
        fullName: user.firstName + ' ' + user.lastName,
      })),
    );

    return ResponseFormatService.responseOk(
      {
        data: usersFound,
        count: userData[1],
        ...(extraUsers.length && { extraUsers }),
      },
      'Community Users',
    );
  }

  @Get('count-by-circle')
  async getUsersCountByCircle(
    @Query() queryParams: SearchUserByCircleDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const [archived, active, pending] = await Promise.all([
      this.userService.getUserCount({
        communityId: req['userData'].currentCommunity,
        circleId: parseInt(queryParams.circleId),
        isUserDeleted: true,
      }),
      this.userService.getUserCount({
        communityId: req['userData'].currentCommunity,
        circleId: parseInt(queryParams.circleId),
        isUserDeleted: false,
        isUserPending: false,
      }),
      this.userService.getUserCount({
        communityId: req['userData'].currentCommunity,
        circleId: parseInt(queryParams.circleId),
        isUserDeleted: false,
        isUserPending: true,
      }),
    ]);

    return ResponseFormatService.responseOk(
      {
        archive: archived,
        active,
        pending,
        total: active + pending + archived,
      },
      'Users Counts By Circle',
    );
  }

  @Get('count-by-community')
  async getUsersCountBycommunity(@Req() req: Request): Promise<ResponseFormat> {
    const [archived, active] = await Promise.all([
      this.userService.getUserCount({
        communityId: req['userData'].currentCommunity,
        isUserDeleted: true,
      }),
      this.userService.getUserCount({
        communityId: req['userData'].currentCommunity,
        isUserDeleted: false,
        isUserPending: false,
      }),
    ]);

    return ResponseFormatService.responseOk(
      { archive: archived, active, total: active + archived },
      'Users Counts By Community',
    );
  }

  @Get('get-upload-url')
  async getUploadUrl(
    @Query()
    queryParams: GetProfileImageUploadUrl,
  ): Promise<ResponseFormat> {
    const signedUrlConfig = await this.awsS3Service.getSignedUrl2(
      queryParams.fileName,
      queryParams.contentType,
      'attachments/users/',
    );
    return ResponseFormatService.responseOk(signedUrlConfig, 'All');
  }

  @Post('unique-count')
  async getUniqueUsersCount(
    @Body() body: GetUniqueUsersCountDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    let users = [];

    if (body.allCommunityMembers) {
      // Find all community users
      users = await this.userService.getCommunityUsers({
        communityId: req['userData'].currentCommunity,
        isDeleted: false,
      });
    } else {
      // Find individual users
      if (body.users && body.users.length) {
        users = await this.userService.getCommunityUsers({
          userIds: body.users,
          communityId: req['userData'].currentCommunity,
          isDeleted: false,
        });
      }

      // Find group users
      if (body.groups && body.groups.length) {
        users = users.concat(
          await this.userCircleService.getCirclesUsers({
            circleIds: body.groups,
            communityId: req['userData'].currentCommunity,
            isUserDeleted: false,
          }),
        );
      }
    }

    const uniqueUsers = uniqBy(users, 'id');

    const count = uniqueUsers.length;

    return ResponseFormatService.responseOk({ count }, 'Unique users count');
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormatService> {
    const users = await this.userService.getUsersWithCommunity({
      id: parseInt(id),
      communityId: req['userData'].currentCommunity,
      join: {
        opportunity: true,
        opportunityType: true,
      },
    });
    if (!users.length) {
      return ResponseFormatService.responseNotFound([], 'User Not Found');
    }

    if (users[0].skills && users[0].skills.length) {
      users[0]['skillsData'] = await this.tagService.getTags({
        where: { id: In(users[0].skills) },
      });
    }
    if (users[0].opportunities && users[0].opportunities.length) {
      users[0][
        'draftOpportunities'
      ] = UtilsService.getUserDraftOpportunityCount(users[0].opportunities);
      delete users[0].opportunities;
    }
    users[0]['communities'] = UtilsService.updateUserCommunityData(
      users[0].userCommunities,
    );

    users[0]['roles'] = await this.roleActorService.getRoleActors({
      where: {
        entityObjectId: null,
        entityType: null,
        actorId: id,
        actorType: RoleActorTypes.USER,
        community: In(
          users[0].userCommunities.map(
            userCommunity => userCommunity.communityId,
          ),
        ),
      },
      relations: ['role'],
    });

    return ResponseFormatService.responseOk(users, '');
  }

  @Permissions(
    RoleLevelEnum.community,
    RequestPermissionsKey.BODY,
    'community',
    [PERMISSIONS_KEYS.manageUserRoles],
    PermissionsCondition.AND,
  )
  @Patch('update-user-role')
  async updateUserRole(
    @Body() body: EditUserRole,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (req['userData'].id === body.userId) {
      throw new ForbiddenException('Forbidden resource');
    }

    const [communityPermissions, role, currentRoleActor] = await Promise.all([
      this.communityService.getPermissions(
        req['userData'].currentCommunity,
        req['userData'].id,
      ),
      this.roleService.getOneRole({
        where: { id: body.role },
      }),
      this.roleActorService.getRoleActors({
        where: {
          entityObjectId: null,
          entityTypeId: null,
          actorId: body.userId,
          actorType: RoleActorTypes.USER,
          communityId: req['userData'].currentCommunity,
        },
        relations: ['role'],
      }),
    ]);

    if (
      communityPermissions.manageUserRoles === PERMISSIONS_MAP.SCENARIO &&
      (role.abbreviation === ROLE_ABBREVIATIONS.ADMIN ||
        _.head(currentRoleActor).role.abbreviation === ROLE_ABBREVIATIONS.ADMIN)
    ) {
      throw new ForbiddenException('Forbidden resource');
    }

    let respData = {};
    if (_.get(currentRoleActor, 'length')) {
      respData = await this.roleActorService.updateRoleActors(
        {
          actorType: RoleActorTypes.USER,
          actorId: body.userId,
          entityObjectId: null,
          entityTypeId: null,
          communityId: req['userData'].currentCommunity,
        },
        { role: body.role },
      );
    } else {
      respData = await this.roleActorService.addRoleActors({
        actorType: RoleActorTypes.USER,
        actorId: body.userId,
        entityObjectId: null,
        entityTypeId: null,
        communityId: req['userData'].currentCommunity,
        role: body.role,
      });
    }

    return ResponseFormatService.responseOk(respData, '');
  }

  @Patch('archive')
  async removeUser(
    @Body() body: ArchiveUserDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const userCommunities = getRepository(UserCommCommunities);
    const updateData = await userCommunities.update(
      { userId: In(body.users), communityId: req['userData'].currentCommunity },
      { isDeleted: body.isDeleted },
    );

    let message = 'User Deleted Successfully';
    if (!body.isDeleted) {
      message = 'User Unarchived Successfully';
    }
    return ResponseFormatService.responseOk(updateData, message);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.userService.updateUser(
      { id: id },
      body,
      req['userData']['currentCommunity'],
      true,
    );

    const userEntity = await this.userService.getUsers({
      relations: [
        'userCommunities',
        'userCommunities.community',
        'opportunities',
        'opportunities.opportunityType',
        'profileImage',
      ],
      where: {
        id: id,
      },
    });
    userEntity[0]['communities'] = UtilsService.updateUserCommunityData(
      userEntity[0].userCommunities,
    );
    if (userEntity[0].opportunities && userEntity[0].opportunities.length) {
      userEntity[0][
        'draftOpportunities'
      ] = UtilsService.getUserDraftOpportunityCount(
        userEntity[0].opportunities,
      );
      delete userEntity[0].opportunities;
    }
    if (userEntity.length) {
      const nonAcceptedInvites = await this.inviteService.getInvites({
        relations: ['community'],
        where: { email: userEntity[0].email, inviteAccepted: false },
      });
      userEntity[0]['invites'] = nonAcceptedInvites;
    }
    updateData['user'] = userEntity[0];
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete('bulk')
  async removeBulkUser(
    @Body('users') users: [],
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.userService.updateUser(
      { id: In(users) },
      { isDeleted: true },
      req['userData']['currentCommunity'],
      true,
    );
    return ResponseFormatService.responseOk(
      deleteData,
      'Users Deleted Successfully',
    );
  }
  findUserCommunity(userCommunitiesObject, communityUrl): {} {
    const matchedCommunity = _.find(userCommunitiesObject, function(o) {
      return parse(o.community.url).hostname === parse(communityUrl).hostname;
    });
    return matchedCommunity;
  }
}
