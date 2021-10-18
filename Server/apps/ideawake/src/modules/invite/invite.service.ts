import { Injectable, Logger } from '@nestjs/common';
import { InviteRepository } from './invite.repository';
import { InviteEntity } from './invite.entity';
import { UserService } from '../user/user.service';
import { In, Brackets } from 'typeorm';
import * as _ from 'lodash';
import { ConfigService } from '../../shared/services/config.service';
import { UtilsService } from '../../providers/utils.service';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { CircleService } from '../circle/circle.service';
import { InviteStatus } from '../../enum';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import { CommunityService } from '../community/community.service';
import { EMAIL_BOOKMARKS } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { UserCommunityService } from '../user/userCommunity.service';
import { UserCircleService } from '../user/userCircle.service';
import { CommunityEntity } from '../community/community.entity';

const configService = new ConfigService();

@Injectable()
export class InviteService {
  private client: ClientProxy;

  constructor(
    public readonly inviteRepository: InviteRepository,
    public readonly userService: UserService,
    public readonly circleService: CircleService,
    public readonly communityService: CommunityService,
    public readonly userCommunityService: UserCommunityService,
    public readonly userCircleService: UserCircleService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: configService.get('REDIS_URL'),
      },
    });
  }

  /**
   * Get invites' counts.
   */
  async getInvitesCounts(options: {
    community: number;
  }): Promise<{
    all: number;
    pending: number;
    accepted: number;
  }> {
    const allInvites = await this.inviteRepository.findAndCount({
      where: { communityId: options.community, isDeleted: false },
    });

    const allInvitesGrouped = _.groupBy(allInvites[0], 'inviteAccepted');

    return {
      all: allInvites[1],
      pending: allInvitesGrouped['false']
        ? allInvitesGrouped['false'].length
        : 0,
      accepted: allInvitesGrouped['true']
        ? allInvitesGrouped['true'].length
        : 0,
    };
  }

  /**
   * Resets the given invite.
   * @param inviteId Invite's Id to reset.
   * @param communityId Community Id of the invite.
   */
  async resetInvite(
    inviteId,
    communityId,
    originUrl,
  ): Promise<{ status: boolean; msg: string; inviteId: string }> {
    const response = await this.getOneInvite({
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
        const communityData = await this.communityService.getOneCommunity({
          where: { id: communityId },
        });
        await this.addInviteEmail({
          code: inviteCode,
          to: response.email,
          url: originUrl,
          isSSO: response.isSSO,
          community: communityData,
        });
        await this.updateInvite(
          { id: response.id },
          {
            inviteCode: inviteCode,
            statusCode: InviteStatus.SENT,
            expiryDate: moment().add(1, 'days'),
          },
        );
      } catch (error) {
        await this.updateInvite(
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
        msg: 'Invites Reset Successfully',
      };
    }
  }

  /**
   * Get invites
   */
  async getInvites(options: {}): Promise<InviteEntity[]> {
    return this.inviteRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'invite',
        ),
      }),
    });
  }

  /**
   * Get invites with filters
   */
  async getInvitesWithFilters(options: {
    community: number;
    inviteAccepted: boolean;
    group?: number;
  }): Promise<InviteEntity[]> {
    const query = this.inviteRepository
      .createQueryBuilder('invite')
      .where('invite.communityId = :community', {
        community: options.community,
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: options.inviteAccepted,
      });

    if (options.group) {
      query.andWhere('invite.circles @> ARRAY[:group]', {
        group: options.group,
      });
    }

    return query.getMany();
  }

  /**
   * Get invites
   */
  async getInvitesAndCount(options: {}): Promise<[InviteEntity[], number]> {
    return this.inviteRepository.findAndCount({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'invite',
        ),
      }),
    });
  }

  /**
   * Get One invites
   */
  async getOneInvite(options: {}): Promise<InviteEntity> {
    return this.inviteRepository.findOne({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'invite',
        ),
      }),
    });
  }

  async getCaseInsensitiveInvite(options: {
    email: string;
    isDeleted: boolean;
    inviteAccepted: boolean;
    communityId: number;
    isSSO: boolean;
  }): Promise<InviteEntity> {
    const optionsUpdated = UtilsService.replaceJoinColumnsForQueries(
      options,
      'invite',
    );

    return this.inviteRepository
      .createQueryBuilder('invite')
      .where('invite.email ILIKE :email', {
        email: optionsUpdated['email'],
      })
      .andWhere('invite.isDeleted = :isDeleted', {
        isDeleted: optionsUpdated['isDeleted'],
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: optionsUpdated['inviteAccepted'],
      })
      .andWhere('invite.isSSO = :isSSO', {
        isSSO: optionsUpdated['isSSO'],
      })
      .andWhere('invite.communityId = :communityId', {
        communityId: optionsUpdated['communityId'],
      })
      .getOne();
  }

  async getCaseInsensitiveInvites(options: {
    emails: string[];
    isDeleted: boolean;
    inviteAccepted: boolean;
    communityId: number;
  }): Promise<InviteEntity[]> {
    const optionsUpdated = UtilsService.replaceJoinColumnsForQueries(
      options,
      'invite',
    );
    const lowerEmails = options.emails.map(email => email.toLowerCase());

    return this.inviteRepository
      .createQueryBuilder('invite')
      .where('LOWER(invite.email) IN (:...emails)', {
        emails: lowerEmails,
      })
      .andWhere('invite.isDeleted = :isDeleted', {
        isDeleted: optionsUpdated['isDeleted'],
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: optionsUpdated['inviteAccepted'],
      })
      .andWhere('invite.isSSO = :isSSO', {
        isSSO: optionsUpdated['isSSO'],
      })
      .andWhere('invite.communityId = :communityId', {
        communityId: optionsUpdated['communityId'],
      })
      .getMany();
  }

  async getInvitesByCommunity(
    communityId: number,
    originUrl?,
    filters?: {},
  ): Promise<{ invites: InviteEntity[]; count: number }> {
    const configService = new ConfigService();
    let originUrlParam: string;
    if (originUrl) {
      originUrlParam = originUrl;
    } else {
      originUrlParam = configService.get('CLIENT_URL');
    }

    const invites = await this.getInvitesAndCount({
      where: {
        community: communityId,
        isDeleted: false,
        ...(filters &&
          filters['inviteAccepted'] && {
            inviteAccepted: filters['inviteAccepted'],
          }),
      },
      relations: ['role'],
      order: {
        id: 'DESC',
      },
    });

    const invitesData = { invites: invites[0], count: invites[1] };

    if (invitesData.invites.length) {
      const newArray = _.map(invitesData.invites, 'email');
      const [users, allGroups] = await Promise.all([
        this.userService.getUsers({ where: { email: In(newArray) } }),
        this.circleService.getCircles({ where: { community: communityId } }),
      ]);

      const allGroupsGrouped = _.groupBy(allGroups, 'id');

      invitesData.invites.forEach((invite, index) => {
        invite['inviteUrl'] = UtilsService.generateInviteUrl(
          originUrlParam,
          invite.inviteCode, // same as invite code
        );
        const foundIndex = _.findIndex(users, function(o) {
          return o.email == invite.email;
        });
        if (foundIndex != -1) {
          invite[
            'userName'
          ] = `${users[foundIndex].firstName} ${users[foundIndex].lastName}`;
          invite['email'] = users[foundIndex].email;
        } else {
          invite['userName'] = '--';
        }

        invite['groups'] = invite.circles
          ? invite.circles.map(groupId => _.head(allGroupsGrouped[groupId]))
          : [];

        if (filters && filters['searchText']) {
          const searchRegex = new RegExp(`.*${filters['searchText']}.*`, 'gi');
          if (
            !invite.email.match(searchRegex) &&
            !invite.name.match(searchRegex) &&
            !invite['userName'].match(searchRegex)
          ) {
            delete invitesData.invites[index];
            invitesData.count--;
          }
        }
      });
      invitesData.invites = _.compact(invitesData.invites);

      if (filters && filters['take']) {
        invitesData.invites = invitesData.invites.slice(
          filters['skip'] || 0,
          (filters['skip'] || 0) + filters['take'],
        );
      }
    }

    return invitesData;
  }

  async getInvitesByCircle(
    take,
    skip,
    circleId,
    searchKeys: { email: string; isDeleted?: boolean },
  ): Promise<{}> {
    const query = this.inviteRepository
      .createQueryBuilder('invite')
      .where(':circles = ANY (invite.circles)', {
        circles: circleId,
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: false,
      })
      .andWhere(
        new Brackets(qb => {
          if (searchKeys.email) {
            qb.orWhere('LOWER(invite.email) like :userName', {
              userName: `%${searchKeys.email.toLowerCase()}%`,
            });
          }
          if (!searchKeys.email) {
            qb.orWhere('1 = :trueCase', {
              trueCase: 1,
            });
          }
        }),
      );

    if (searchKeys.hasOwnProperty('isDeleted')) {
      query.andWhere('invite.isDeleted = :isDeleted', {
        isDeleted: searchKeys.isDeleted,
      });
    }

    return query
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }
  async getInvitesByCircleCount(circleId): Promise<{}> {
    return this.inviteRepository
      .createQueryBuilder('invite')
      .where(':circles = ANY (invite.circles)', {
        circles: circleId,
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: false,
      })
      .andWhere('invite.isDeleted = :isDeleted', {
        isDeleted: false,
      })
      .getCount();
  }
  async searchInvitesByCommunity(
    take,
    skip,
    communityId,
    searchKeys: { email: string },
  ): Promise<{}> {
    return this.inviteRepository
      .createQueryBuilder('invite')
      .where(':community = invite.communityId', {
        community: communityId,
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: false,
      })
      .andWhere(
        new Brackets(qb => {
          if (searchKeys.email) {
            qb.orWhere('LOWER(invite.email) like :userName', {
              userName: `%${searchKeys.email.toLowerCase()}%`,
            });
          }
          if (!searchKeys.email) {
            qb.orWhere('1 = :trueCase', {
              trueCase: 1,
            });
          }
        }),
      )
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }
  async getInvitesByCommunityCount(communityId): Promise<{}> {
    return this.inviteRepository
      .createQueryBuilder('invite')
      .where(':community = invite.communityId', {
        community: communityId,
      })
      .andWhere('invite.inviteAccepted = :inviteAccepted', {
        inviteAccepted: false,
      })
      .andWhere('invite.isDeleted = :isDeleted', {
        isDeleted: false,
      })
      .getCount();
  }
  /**
   * Add invite
   */
  async addInvite(data: {}): Promise<any> {
    const inviteCreated = this.inviteRepository.create(
      UtilsService.replaceJoinColumnsForQueries(data, 'invite'),
    );
    return this.inviteRepository.save(inviteCreated);
  }
  /**
   * Add invite
   */
  async addInviteEmail(_data: {
    code;
    to: string;
    url;
    isSSO;
    community;
  }): Promise<any> {
    const defaultEmailTemplate = _.head(
      await this.client
        .send('getDefaultEmailTemplates', { name: 'Default Email Template' })
        .toPromise(),
    );
    const inviteEmailTemplate = _.head(
      await this.client
        .send('getEmailTemplateForCommunity', {
          name: 'Invite User',
          community: _data.community.id,
        })
        .toPromise(),
    );

    const replacements = {
      [EMAIL_BOOKMARKS.BODY]: inviteEmailTemplate['body'],
      [EMAIL_BOOKMARKS.SUBJECT]: inviteEmailTemplate['subject'],
      [EMAIL_BOOKMARKS.FOOTER]: inviteEmailTemplate['footerSection'],

      [EMAIL_BOOKMARKS.COMPANY_NAME]: _data.community.name,
      [EMAIL_BOOKMARKS.LINK_BTN]: UtilsService.generateInviteUrlButton(
        _data.url,
        _data.code,
        _data.isSSO,
      ),
      [EMAIL_BOOKMARKS.COMMUNITY_NAME]: _data.community.name,
      [EMAIL_BOOKMARKS.FEATURE_IMG]: inviteEmailTemplate['featureImage'],
      [EMAIL_BOOKMARKS.TAG_LINE]: '',
    };

    _.forEach(replacements, (replacement, key) => {
      inviteEmailTemplate['subject'] = inviteEmailTemplate['subject'].replace(
        new RegExp(key, 'g'),
        replacement,
      );
      defaultEmailTemplate['body'] = defaultEmailTemplate['body'].replace(
        new RegExp(key, 'g'),
        replacement,
      );
    });

    return this.client
      .send('addSendEmailsData', {
        to: _data.to,
        from: inviteEmailTemplate['senderEmail'],
        emailContent: defaultEmailTemplate['body'],
        status: 'pending',
        community: _data.community.id,
        subject: inviteEmailTemplate['subject'],
      })
      .toPromise();
  }

  /**
   * Update invite
   */
  async updateInvite(options: {}, data: {}): Promise<{}> {
    return this.inviteRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'invite'),
      UtilsService.replaceJoinColumnsForQueries(data, 'invite'),
    );
  }

  /**
   * Permanently delete an invite.
   */
  async deleteInvite(options: {}): Promise<{}> {
    return this.inviteRepository.delete(
      UtilsService.replaceJoinColumnsForQueries(options, 'invite'),
    );
  }

  /**
   * [Temporary] Script to create pending users for the existing non-accepted
   * invites in the system.
   */
  async createPendingUsersForExistingInvites(): Promise<void> {
    try {
      // Get existing invites.
      const invites = await this.getInvites({
        where: { isDeleted: false, inviteAccepted: false },
      });
      const invitesByCommunity = _.groupBy(invites, 'communityId');

      if (invites.length) {
        const existingUsers = await this.userService.getUsers({});
        const existingUsersByEmails = _.keyBy(existingUsers, 'email');

        for (const communityId in invitesByCommunity) {
          const commInvites = invitesByCommunity[communityId];
          // Check existing users for duplicates.
          const existingCommUsers = await this.userService.getUsersWithFilters({
            communityId: parseInt(communityId),
            ignoreJoin: { communities: true, profileImage: true },
          });
          const communityUsersByEmails = _.keyBy(existingCommUsers, 'email');

          for (const invite of commInvites) {
            if (!_.get(existingUsersByEmails, invite.email)) {
              // Create a new pending user.
              await this.userService.addUserWithData({
                user: {
                  firstName: _.head(_.split(invite.email, '@')),
                  lastName: '',
                  email: invite.email,
                  role: invite.roleId,
                  isDeleted: false,
                  isPending: true,
                },
                community: parseInt(communityId),
                circleIds: _.map(invite.circles, circleId =>
                  parseInt(circleId),
                ),
              });
            } else if (!_.get(communityUsersByEmails, invite.email)) {
              // Create a pending community user.
              await this.userService.addExistingUserToCommunity({
                userId: existingUsersByEmails[invite.email].id,
                communityId: parseInt(communityId),
                roleId: invite.roleId,
                isArchivedUser: false,
                isPendingUser: true,
                circleIds: _.map(invite.circles, circleId =>
                  parseInt(circleId),
                ),
              });
            }
          }
        }
      }
      Logger.error(
        '[Invites]: Finished creating pending users for existing invites',
      );
    } catch (error) {
      Logger.error(
        'Error while creating pending users for existing invites',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  /**
   * Link circle to pending invite when a pending user is added in a circle.
   * @param users Existing users in the community.
   * @param userCirclesInput User ids to circle ids mapping.
   * @param communityId Community Id.
   */
  async addCircleToPendingInvite(
    users: UserEntity[],
    userCirclesInput: {}[],
    communityId: number,
  ): Promise<void> {
    // Add the selected users' circles in pending invites.
    const usersByEmail = _.keyBy(users, 'email');
    const userCirclesByUser = _.groupBy(userCirclesInput, 'userId');
    const invites = await this.getInvites({
      where: {
        email: In(users.map(user => user.email)),
        communityId: communityId,
        isDeleted: false,
        inviteAccepted: false,
      },
    });

    for (const invite of invites) {
      const userId = _.get(usersByEmail[invite.email], 'id');
      if (userId) {
        const circleIds = _.map(userCirclesByUser[userId], 'circleId');

        if (_.get(circleIds, 'length')) {
          const addedCircles = _.uniq(
            _.concat(invite.circles || [], circleIds),
          );
          this.updateInvite({ id: invite.id }, { circles: addedCircles });
        }
      }
    }
  }

  /**
   * Revoke an invite.
   * @param options Options to search invite on.
   */
  async revokeInvite(options: {
    id: number;
    communityId: number;
  }): Promise<{}> {
    // Get pending invite.
    const invite = await this.getOneInvite({
      id: options.id,
      communityId: options.communityId,
      isDeleted: false,
      inviteAccepted: false,
    });

    let res = {};
    if (invite) {
      // Archive user.
      try {
        const user = await this.userService.getOneUser({ email: invite.email });
        if (user) {
          await this.userCommunityService.archiveCommunityUsers({
            userId: user.id,
            communityId: options.communityId,
          });
          await this.userCircleService.deleteUserCircle({ userId: user.id });
        }
      } catch (error) {
        Logger.error(
          'Error archiving pending user on invite revocation:',
          error,
        );
      }

      // Archive invite.
      res = await this.updateInvite(options, { isDeleted: true });
    }

    return res;
  }

  /**
   * Email newly created invite to user.
   * @param invite Created invite.
   * @param inviteCode Invite code.
   * @param originUrl Origin url of the community.
   * @param community Communty of invited user.
   * @param ssoHostUrl Url used in case of sso invite.
   */
  async emailInvite(
    invite: InviteEntity,
    inviteCode: string,
    originUrl: string,
    community: CommunityEntity,
    ssoHostUrl: string,
  ): Promise<void> {
    try {
      let inviteUrl: string;
      if (invite.isSSO === true) {
        inviteUrl = `${ssoHostUrl}/auth/saml?community=${community.id}`;
      } else {
        inviteUrl = originUrl;
      }
      await this.addInviteEmail({
        code: inviteCode,
        to: invite.email,
        url: inviteUrl,
        isSSO: invite.isSSO,
        community,
      });
      await this.updateInvite(
        { id: invite.id },
        { statusCode: InviteStatus.SENT },
      );
    } catch (error) {
      await this.updateInvite(
        { id: invite.id },
        {
          bounceInfo: { message: error.response },
          statusCode: InviteStatus.NOTSENT,
        },
      );
    }
  }
}
