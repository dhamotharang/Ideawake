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
  Logger,
} from '@nestjs/common';
import { createObjectCsvStringifier as createCsvWriter } from 'csv-writer';
import { InviteService } from './invite.service';
import {
  InviteUsersDto,
  SendInviteDto,
  ResetInviteDto,
  SearchInvitesByCircleDto,
  SearchInviteByCommunityDto,
  GetInvitesDto,
} from './dto';
import * as _ from 'lodash';
import { MailService } from '../../shared/services/mailer.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { InviteStatus } from '../../enum';
import moment = require('moment');
import { Request } from 'express';
import { InviteGateway } from './invite.gateway';
import { CommunityService } from '../community/community.service';
import { UserService } from '../user/user.service';
import { EmailTemplateService } from '../email/email-template.service';
import { CircleService } from '../circle/circle.service';
import { In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GetInvitesCountsDto } from './dto/GetInvitesCountsDto';
import { ResendAllInvitesDto } from './dto/ResendAllInvitesDto';

@Controller('invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    public readonly mailService: MailService,
    public readonly inviteGateway: InviteGateway,
    public readonly communityService: CommunityService,
    public readonly userService: UserService,
    public readonly emailTemplateService: EmailTemplateService,
    public readonly circleService: CircleService,
  ) {}

  @Post('send-invites')
  async sendInvites(
    @Body() body: SendInviteDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      const uniqRecords: InviteUsersDto[] = _.uniqBy(body.inviteUsers, user =>
        _.toLower(user.email),
      );
      uniqRecords.forEach(rec => {
        rec.email = _.toLower(rec.email);
      });
      const emailsToSend = _.map(uniqRecords, user => _.toLower(user.email));

      // Check existing pending invites for duplicates.
      const existingInvites = await this.inviteService.getCaseInsensitiveInvites(
        {
          emails: emailsToSend,
          isDeleted: false,
          inviteAccepted: false,
          communityId: req['userData'].currentCommunity,
        },
      );

      // Check existing users for duplicates.
      const existingCommUsers = await this.userService.getUsersWithFilters({
        emails: emailsToSend,
        communityId: req['userData'].currentCommunity,
        // isDeleted: false,
        ignoreJoin: { communities: true, profileImage: true },
      });

      const duplicatedEmails = _.uniq(
        _.concat(
          _.map(existingInvites, 'email'),
          _.map(existingCommUsers, 'email'),
        ),
      );

      const nonDuplicateUniqueRecords = _.filter(uniqRecords, function(o) {
        return duplicatedEmails.indexOf(o.email) == -1 &&
          o.email !== req['userData'].email
          ? o.email
          : '';
      });

      for (let index = 0; index < nonDuplicateUniqueRecords.length; index++) {
        nonDuplicateUniqueRecords[index]['community'] =
          req['userData'].currentCommunity;
        nonDuplicateUniqueRecords[index]['user'] = req['userData'].id;
        nonDuplicateUniqueRecords[index]['isDeleted'] = false;
        nonDuplicateUniqueRecords[index]['inviteAccepted'] = false;
        nonDuplicateUniqueRecords[index]['isSSO'] = body.isSSO;
      }
      const originUrl = req.headers.origin;
      if (nonDuplicateUniqueRecords.length) {
        const addResponse = await this.inviteService.addInvite(
          nonDuplicateUniqueRecords,
        );
        const currentCommunityData = await this.communityService.getOneCommunity(
          {
            where: { id: req['userData'].currentCommunity },
            relations: ['authIntegration'],
          },
        );

        const existingUsers = await this.userService.getUsers({
          where: { email: In(_.map(nonDuplicateUniqueRecords, 'email')) },
        });
        const existingUsersByEmails = _.keyBy(existingUsers, 'email');

        await Promise.all(
          addResponse.map(async obj => {
            const inviteCode = bcrypt
              .hashSync(obj.email, 10)
              .replace(/[\/,?]/g, '');

            await this.inviteService.updateInvite(
              { id: obj.id },
              { inviteCode: inviteCode, expiryDate: moment().add(1, 'days') },
            );

            try {
              if (!_.get(existingUsersByEmails, obj.email)) {
                // Create a new pending user.
                await this.userService.addUserWithData({
                  user: {
                    firstName: _.head(_.split(obj.email, '@')),
                    lastName: '',
                    email: obj.email,
                    role: obj.roleId,
                    isDeleted: false,
                    isPending: true,
                  },
                  community: req['userData'].currentCommunity,
                  circleIds: _.map(obj.circles, circleId => parseInt(circleId)),
                });
              } else {
                // Create a pending community user.
                await this.userService.addExistingUserToCommunity({
                  userId: existingUsersByEmails[obj.email].id,
                  communityId: req['userData'].currentCommunity,
                  roleId: obj.roleId,
                  isArchivedUser: false,
                  isPendingUser: true,
                  circleIds: _.map(obj.circles, circleId => parseInt(circleId)),
                });
              }
            } catch (error) {
              Logger.error('Error creating pending users for invites:', error);
            }

            // Send invite emails.
            this.inviteService.emailInvite(
              obj,
              inviteCode,
              originUrl as string,
              currentCommunityData,
              `${req.protocol}://${req.headers.host}`,
            );
          }),
        );

        await this.inviteGateway.pushInvites(req['userData'].currentCommunity);
        return ResponseFormatService.responseOk(
          addResponse,
          'Invites Sent Successfully',
        );
      } else {
        return ResponseFormatService.responseOk(
          [],
          'Invites are already sent to provided emails.',
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @Patch('resend-all')
  async resendAllInvites(
    @Body() body: ResendAllInvitesDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      const invites = await this.inviteService.getInvitesWithFilters({
        ...body,
        inviteAccepted: false,
      });

      const invitesResetStatus = await Promise.all(
        invites.map(invite =>
          this.inviteService.resetInvite(
            invite.id,
            body.community,
            req.headers.origin,
          ),
        ),
      );

      return ResponseFormatService.responseOk(
        invitesResetStatus,
        'All Invites Resent.',
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('reset-invite')
  async resetInvite(
    @Body() body: ResetInviteDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      //   const emailTemplates = await this.emailTemplateService.getEmailTemplates({
      //     where: { name: 'sendInvite' },
      //   });
      const reset = async (
        inviteId,
      ): Promise<{ status: boolean; msg: string; inviteId: string }> => {
        const response = await this.inviteService.getOneInvite({
          where: { id: inviteId, isDeleted: false },
        });
        if (!response) {
          return { inviteId: inviteId, status: false, msg: 'Invite Not Found' };
        }
        if (response.inviteAccepted) {
          const existingUser = await this.userService.getUsers({
            where: { email: response.email },
          });
          response['existingUser'] = existingUser[0];
          return {
            inviteId: inviteId,
            status: false,
            msg: 'User Alredy Registered',
          };
        } else {
          const inviteCode = bcrypt
            .hashSync(response.email, 10)
            .replace(/[\/,?]/g, '');
          try {
            const originUrl = req.headers.origin;
            // await this.mailService.sendInvite(
            //   response.id,
            //   response.email,
            //   originUrl,
            //   emailTemplates[0].body,
            // );
            const communityData = await this.communityService.getOneCommunity({
              where: { id: body.communityId },
              relations: ['authIntegration'],
            });
            let inviteUrl;
            if (response.isSSO === true) {
              inviteUrl =
                `${req.protocol}://` +
                req.headers.host +
                `/auth/saml?community=${communityData.id}`;
            } else {
              inviteUrl = originUrl;
            }
            await this.inviteService.addInviteEmail({
              code: inviteCode,
              to: response.email,
              url: inviteUrl,
              isSSO: response.isSSO,
              community: communityData,
            });
            await this.inviteService.updateInvite(
              { id: response.id },
              {
                inviteCode: inviteCode,
                statusCode: InviteStatus.SENT,
                expiryDate: moment().add(1, 'days'),
              },
            );
          } catch (error) {
            await this.inviteService.updateInvite(
              { id: response.id },
              {
                inviteCode: inviteCode,
                statusCode: InviteStatus.NOTSENT,
                expiryDate: moment().add(1, 'days'),
              },
            );
          }

          return {
            inviteId: inviteId,
            status: true,
            msg: 'Invite Reset Successfully',
          };
        }
      };
      const finalResponseData = [];
      for (let j = 0; j < body.inviteIds.length; j++) {
        finalResponseData.push(await reset(body.inviteIds[j]));
      }
      await this.inviteGateway.pushInvites(body.communityId);
      return ResponseFormatService.responseOk(
        finalResponseData,
        'Invite Reset',
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('create-old-pending-users')
  async createPendingUsersForExistingInvites(): Promise<ResponseFormat> {
    this.inviteService.createPendingUsersForExistingInvites();
    return ResponseFormatService.responseOk({}, 'Script started');
  }

  @Post()
  async addInvite(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.inviteService.addInvite(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get('counts')
  async getInvitesCounts(
    @Query() queryParams: GetInvitesCountsDto,
  ): Promise<ResponseFormat> {
    const counts = await this.inviteService.getInvitesCounts(queryParams);
    return ResponseFormatService.responseOk(counts, 'All invites counts.');
  }

  @Get()
  async getAllInvites(@Req() req: Request): Promise<ResponseFormat> {
    const invites = await this.inviteService.getInvites({
      where: { communityId: req['userData'].currentCommunity },
    });
    return ResponseFormatService.responseOk(invites, 'All');
  }

  @Get('circle')
  async getInvitesByCircle(
    @Query() queryParams: SearchInvitesByCircleDto,
  ): Promise<ResponseFormat> {
    const inviteData = await this.inviteService.getInvitesByCircle(
      queryParams.limit,
      queryParams.offset,
      queryParams.circleId,
      {
        email: queryParams.searchByEmail ? queryParams.searchByEmail : '',
        isDeleted: false,
      },
    );
    if (!inviteData[0].length) {
      return ResponseFormatService.responseOk([], 'No Invites Available');
    }
    const circleIds = _.uniq(_.flatMap(_.map(inviteData[0], 'circles')));
    const circleData = await this.circleService.getCircles({
      where: { id: In(circleIds) },
    });
    const uniqueCircleData = _.fromPairs(_.map(circleData, i => [i.id, i]));
    const dataCount = await this.inviteService.getInvitesByCircleCount(
      queryParams.circleId,
    );
    if (queryParams.sortBy && queryParams.sortType) {
      const dataSorted = _.orderBy(
        inviteData[0],
        [queryParams.sortBy],
        [queryParams.sortType],
      );
      inviteData[0] = dataSorted;
    }
    if (queryParams.exportData === 'true') {
      const csvWriter = createCsvWriter({
        header: [
          { id: 'fullName', title: 'NAME' },
          { id: 'senderName', title: 'Email Sender' },
          { id: 'email', title: 'Email:' },
          { id: 'isDeleted', title: 'Archived' },
        ],
      });
      const dataExport = [];
      (inviteData[0] || []).forEach(user => {
        dataExport.push({
          fullName: user.name,
          senderName: user.senderName,
          email: user.email,
          isDeleted: user.isDeleted,
        });
      });

      const data = {
        data: csvWriter.stringifyRecords(dataExport),
        headers: csvWriter.getHeaderString(),
      };

      return ResponseFormatService.responseOk(data, 'Exported Successfully');
    }
    return ResponseFormatService.responseOk(
      { data: inviteData[0], count: dataCount, circles: uniqueCircleData },
      'Invites By Circle',
    );
  }

  @Get('community/search')
  async getInvitesByCommunity(
    @Query() queryParams: SearchInviteByCommunityDto,
  ): Promise<ResponseFormat> {
    const inviteData = await this.inviteService.searchInvitesByCommunity(
      queryParams.limit,
      queryParams.offset,
      queryParams.communityId,
      { email: queryParams.searchByEmail ? queryParams.searchByEmail : '' },
    );
    if (!inviteData[0].length) {
      return ResponseFormatService.responseOk([], 'No Invites Available');
    }
    const circleIds = _.uniq(_.flatMap(_.map(inviteData[0], 'circles')));
    const circleData = await this.circleService.getCircles({
      where: { id: In(circleIds) },
    });
    const uniqueCircleData = _.fromPairs(_.map(circleData, i => [i.id, i]));
    const dataCount = await this.inviteService.getInvitesByCommunityCount(
      queryParams.communityId,
    );
    if (queryParams.sortBy && queryParams.sortType) {
      const dataSorted = _.orderBy(
        inviteData[0],
        [queryParams.sortBy],
        [queryParams.sortType],
      );
      inviteData[0] = dataSorted;
    }
    if (queryParams.exportData === 'true') {
      const csvWriter = createCsvWriter({
        header: [
          { id: 'fullName', title: 'NAME' },
          { id: 'senderName', title: 'Email Sender' },
          { id: 'email', title: 'Email:' },
          { id: 'isDeleted', title: 'Archived' },
        ],
      });
      const dataExport = [];
      (inviteData[0] || []).forEach(user => {
        dataExport.push({
          fullName: user.name,
          senderName: user.senderName,
          email: user.email,
          isDeleted: user.isDeleted,
        });
      });

      const data = {
        data: csvWriter.stringifyRecords(dataExport),
        headers: csvWriter.getHeaderString(),
      };

      return ResponseFormatService.responseOk(data, 'Exported Successfully');
    }
    return ResponseFormatService.responseOk(
      { data: inviteData[0], count: dataCount, circles: uniqueCircleData },
      'Invites By Circle',
    );
  }

  @Get('count-by-circle')
  async getInvitesCountByCircle(@Query()
  queryParams: {
    circleId: string;
  }): Promise<ResponseFormat> {
    const dataCount = await this.inviteService.getInvitesByCircleCount(
      queryParams.circleId,
    );

    return ResponseFormatService.responseOk(
      { count: dataCount },
      'Invites Count By Circle',
    );
  }

  @Get('count-by-community')
  async getInvitesCountByCommunity(@Query()
  queryParams: {
    communityId: string;
  }): Promise<ResponseFormat> {
    const dataCount = await this.inviteService.getInvitesByCommunityCount(
      queryParams.communityId,
    );

    return ResponseFormatService.responseOk(
      { count: dataCount },
      'Invites Count By Circle',
    );
  }

  @Get('validate')
  async validateInvite(@Query()
  queryParams: {
    inviteCode: string;
    loadUser: boolean;
  }): Promise<ResponseFormat> {
    const invite = await this.inviteService.getInvites({
      where: { inviteCode: queryParams.inviteCode, isDeleted: false },
      relations: ['role'],
    });
    if (!invite.length) {
      return ResponseFormatService.responseNotFound([], 'Invalid Invite Link');
    }
    let userData;
    if (queryParams.loadUser) {
      userData = await this.userService.getUsers({
        where: { email: invite[0].email, isPending: false },
      });
      invite[0]['user'] = userData[0];
    }
    return ResponseFormatService.responseOk(invite, '');
  }

  @Get(':id')
  async getInvite(
    @Param('id') id: string,
    @Query() queryParams: { loadUser: boolean },
  ): Promise<ResponseFormat> {
    const invite = await this.inviteService.getInvites({
      where: { id: id },
      relations: ['role'],
    });
    let userData;
    if (queryParams.loadUser) {
      userData = await this.userService.getUsers({
        where: { email: invite[0].email },
      });
      invite[0]['user'] = userData[0];
    }
    return ResponseFormatService.responseOk(invite, '');
  }
  @Get('invites-by-community/:communityId')
  async getInvitesByCommunityId(
    @Param('communityId') communityId: number,
    @Query() queryParams: GetInvitesDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const originUrl = req.headers.origin;
    const invitesData = await this.inviteService.getInvitesByCommunity(
      communityId,
      originUrl,
      queryParams,
    );

    return ResponseFormatService.responseOk(
      invitesData,
      invitesData.invites.length ? 'Invites Data' : 'No Data Available',
    );
  }

  @Patch(':id')
  async updateInvite(
    @Param('id') id: string,
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    let updateResponse = {};
    if (_.get(body, 'isDeleted')) {
      updateResponse = await this.inviteService.revokeInvite({
        id: parseInt(id),
        communityId: req['userData'].currentCommunity,
      });
    } else {
      updateResponse = await this.inviteService.updateInvite(
        { id: parseInt(id), communityId: req['userData'].currentCommunity },
        body,
      );
    }
    return ResponseFormatService.responseOk(updateResponse, '');
  }

  @Delete('circle')
  async removeCircleInvite(@Body()
  body: {
    inviteIds: [];
    circleId: string;
  }): Promise<ResponseFormat> {
    const data = await this.inviteService.getInvites({
      where: { id: In(body.inviteIds) },
    });
    for (const iterator of data) {
      await this.inviteService.updateInvite(
        { id: iterator.id },
        {
          circles: _.remove(iterator.circles, function(n) {
            return n !== body.circleId;
          }),
        },
      );
    }
    return ResponseFormatService.responseOk(
      body.inviteIds,
      'Invite Deleted Successfully',
    );
  }

  @Delete('bulk')
  async removeBulkInvite(
    @Body('invites') invites: [],
  ): Promise<ResponseFormat> {
    const deleteData = await this.inviteService.updateInvite(
      { id: In(invites) },
      { isDeleted: true },
    );
    return ResponseFormatService.responseOk(
      deleteData,
      'Invite Deleted Successfully',
    );
  }

  @Delete(':id')
  async revokeInvite(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteResponse = await this.inviteService.revokeInvite({
      id: parseInt(id),
      communityId: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(
      deleteResponse,
      'Invite Revoked Successfully',
    );
  }
}
