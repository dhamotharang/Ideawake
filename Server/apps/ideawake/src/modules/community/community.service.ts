import { Injectable } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CommunityEntity } from './community.entity';
import { Brackets, getConnection, In, getRepository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { RoleService } from '../role/role.service';
import { DEFAULT_ROLES } from '../../common/constants/default-role-permissions';
import { CommunityWisePermissionService } from '../communityWisePermission/communityWisePermission.service';
import { CommunityWisePermissionEntity } from '../communityWisePermission/communityWisePermission.entity';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { CommunityActionPoints } from '../../shared/services/communityActionPoint.service';
import * as _ from 'lodash';
import { UserService } from '../user/user.service';
import {
  ENVIRONMENTS,
  PERMISSIONS_MAP,
} from '../../common/constants/constants';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import { RolesEnum } from '../../enum/roles.enum';
import { RoleActorTypes } from '../../enum';
import {
  DEFAULT_STATUSES,
  DEFAULT_OPPORTUNITY_TYPES,
} from '../../common/constants/defaults';
import { OpportunityTypeEntity } from '../opportunityType/opportunityType.entity';
import { StatusEntity } from '../status/status.entity';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { ENTITY_TYPES } from '../../common/constants/constants';
import { UserCommunityService } from '../user/userCommunity.service';
import { ConfigService } from '../../shared/services/config.service';

@Injectable()
export class CommunityService {
  private client: ClientProxy;
  private configService = new ConfigService();

  constructor(
    public readonly communityRepository: CommunityRepository,
    private readonly microServiceClient: MicroServiceClient,
    private readonly roleActorService: RoleActorsService,
    private readonly roleService: RoleService,
    private readonly communityWisePermissionService: CommunityWisePermissionService,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
    private readonly userService: UserService,
    private readonly userCommunityService: UserCommunityService,
  ) {
    this.client = this.microServiceClient.client();
  }

  /**
   * Get communities
   */
  async getCommunityUsers(options: {
    communityId: string | number;
    searchText?: string;
    isDeleted?: boolean;
  }): Promise<{}> {
    const query = this.communityRepository
      .createQueryBuilder('community')
      .innerJoinAndSelect('community.communityUsers', 'communityUsers')
      .innerJoinAndSelect('communityUsers.user', 'user')
      .leftJoinAndSelect('user.profileImage', 'profileImage')
      .where('community.id = :communityId', {
        communityId: options.communityId,
      });

    if (options.searchText) {
      query.andWhere(
        new Brackets(qb => {
          qb.orWhere('user.firstName ILIKE :searchFName', {
            searchFName: `%${options.searchText}%`,
          });
          qb.orWhere('user.lastName ILIKE :searchLName', {
            searchLName: `%${options.searchText}%`,
          });
          qb.orWhere('user.email ILIKE :searchEmail', {
            searchEmail: `%${options.searchText}%`,
          });
          qb.orWhere(
            `user.firstName || ' ' || user.lastName ILIKE :searchName`,
            {
              searchName: `%${options.searchText}%`,
            },
          );
        }),
      );
    }

    if (options.hasOwnProperty('isDeleted')) {
      query.andWhere('communityUsers.isDeleted = :isDeleted', {
        isDeleted: options.isDeleted,
      });
    }
    return query.getMany();
  }

  /**
   * Get communities
   */
  async getCommunities(options: {}): Promise<CommunityEntity[]> {
    return this.communityRepository.find(options);
  }

  /**
   * Get communities
   */
  async getOneCommunity(options: {}): Promise<CommunityEntity> {
    return this.communityRepository.findOne(options);
  }

  /**
   * Get user Communities
   */
  async getTenantCommunities(params: {
    tenant: number;
    isDeleted?: boolean;
  }): Promise<CommunityEntity[]> {
    if (params.isDeleted === undefined) {
      delete params.isDeleted;
    }
    return this.getCommunities({
      where: { ...params },
      relations: ['tenant', 'ownerUser'],
    });
  }

  /**
   * Get user Communities
   */
  async getUserCommunities(
    userId: number,
    isManageable: boolean,
    isDeleted?: boolean,
  ): Promise<CommunityEntity[]> {
    const user = await this.userService.getOneUser({
      where: { id: userId },
      relations: [
        'userCommunities',
        'userCommunities.community',
        'userCommunities.community.tenant',
        'userCommunities.community.ownerUser',
      ],
    });
    let communities = user.userCommunities.map(userCom => userCom.community);

    if (isManageable) {
      const promiseArray = [];

      _.map(communities, (val: CommunityEntity) => {
        promiseArray.push({
          communityId: val.id,
          permissions: this.getPermissions(val.id, userId),
        });
      });
      const res = await Promise.all(
        promiseArray.map(val =>
          val.permissions.then(permissions => ({ ...val, permissions })),
        ),
      );
      const resGrouped = _.groupBy(res, 'communityId');
      _.map(communities, (valCom, keyCom) => {
        if (
          _.head(resGrouped[valCom.id.toString()]).permissions
            .manageCommunities === PERMISSIONS_MAP.DENY
        ) {
          delete communities[keyCom];
        }
      });
    }
    if (isDeleted !== undefined) {
      _.map(communities, (valCom, keyCom) => {
        if (valCom.isDeleted !== isDeleted) {
          delete communities[keyCom];
        }
      });
    }

    communities = communities.filter(sub => !_.isEmpty(sub));

    return communities;
  }

  async getPermissions(
    communityId: number,
    userId: number,
  ): Promise<CommunityWisePermissionEntity> {
    const options = { userId };
    const permissions = await this.roleActorService.getEntityPermissions(
      null,
      null,
      communityId,
      options,
    );

    if (permissions.postOpportunity === 1) {
      // TODO: check opportunity types' post/exp settings whether there's atleast
      // one type of opportunity that a user can post. Otherwise, block access.
      permissions.postOpportunity = 2;
    }

    return permissions;
  }

  async getCommunityFromUrl(url: string): Promise<CommunityEntity> {
    const lowerCaseUrl = url.toLowerCase();
    const options = {
      where: [
        { url: lowerCaseUrl },
        { url: `http://${lowerCaseUrl}` },
        { url: `https://${lowerCaseUrl}` },
      ],
      relations: ['communityAppearanceSetting'],
    };
    return this.getOneCommunity(options);
  }

  /**
   * create new community
   */
  async createNewCommunity(data: {}, userId: number): Promise<CommunityEntity> {
    const community = await this.getOneCommunity({
      where: { id: data['community'] },
      relations: ['tenant'],
    });

    // get all tenant communities
    const tenantCommunities = await this.getTenantCommunities({
      tenant: community.tenant.id,
    });

    const communityDataUpdated = {
      ...data,
      ...(!_.get(data, 'defaultLanguage') && {
        defaultLanguage: community.defaultLanguage,
      }),
      createdBy: userId,
      updatedBy: userId,
      tenant: community.tenant,
      ownerUser: userId,
      isDeleted: false,
    };
    delete communityDataUpdated['community'];
    const communitySavedData = await this.addCommunity(communityDataUpdated);

    // get all community admins
    const tenantCommunitiesIds = tenantCommunities.map(com => com.id);
    const adminRoles = await this.roleService.getRoles({
      where: {
        level: RoleLevelEnum.community,
        community: In(tenantCommunitiesIds),
        title: RolesEnum.admin,
      },
      relations: ['community'],
    });
    const tenantAdminRoleActors = await this.roleActorService.getRoleActors({
      where: adminRoles.map(role => ({
        actorType: RoleActorTypes.USER,
        entityType: null,
        entityObjectId: null,
        community: role.community.id,
        role: role.id,
      })),
    });
    const tenantAdminUserIds = tenantAdminRoleActors.map(
      adminActor => adminActor.actorId,
    );
    const tenantAdmins = await this.userService.getUsers({
      where: { id: In(tenantAdminUserIds) },
    });

    // assign required role
    const role = (await this.roleService.getRoles({
      where: {
        level: RoleLevelEnum.community,
        community: communitySavedData.id,
        title: RolesEnum.admin,
      },
    }))[0];

    await Promise.all(
      tenantAdmins.map(admin =>
        this.roleActorService.addRoleActors({
          role,
          actorType: RoleActorTypes.USER,
          actorId: admin.id,
          entityObjectId: null,
          entityType: null,
          community: communitySavedData.id,
        }),
      ),
    );

    // Add community users.
    await Promise.all(
      tenantAdmins.map(admin =>
        this.userCommunityService.addUserCommunity({
          userId: admin.id,
          communityId: communitySavedData.id,
          isDeleted: false,
        }),
      ),
    );

    return communitySavedData;
  }

  /**
   * Add community
   */
  async addCommunity(data: {}): Promise<CommunityEntity> {
    const communityCreated = this.communityRepository.create(data);
    const communityData = await this.communityRepository.save(communityCreated);

    // adding default roles
    await Promise.all(
      _.map(Object.values(DEFAULT_ROLES), async defRole => {
        const role = await this.roleService.addRole({
          title: defRole.title,
          description: defRole.description,
          level: defRole.level,
          community: communityData.id,
        });

        await this.communityWisePermissionService.addCommunityWisePermission({
          role: role,
          community: communityData.id,
          ...defRole.permissions,
        });
      }),
    );

    // adding default statuses
    const defStatuses = _.map(DEFAULT_STATUSES, defStatus => ({
      ...defStatus,
      community: communityData,
    }));

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(StatusEntity)
      .values(defStatuses)
      .execute();

    // Adding default opportunity types
    const defaultOppTypes = DEFAULT_OPPORTUNITY_TYPES.map(oppType => ({
      ...oppType,
      community: communityData,
    }));
    const opportunityTypeRepository = getRepository(OpportunityTypeEntity);
    const opportunityTypesCreated = await opportunityTypeRepository.create(
      defaultOppTypes,
    );
    const savedOpportunityType = await opportunityTypeRepository.save(
      opportunityTypesCreated,
    );

    // Adding default experience settings for defaul opportunity types.
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.OPPORTUNITY_TYPE,
    );
    await Promise.all(
      savedOpportunityType.map(val =>
        this.entityExperienceSettingService.addEntityExperienceSetting({
          allowOpportunityOwnership: true,
          allowOpportunityTeams: true,
          allowOpportunityCosubmitters: true,
          community: communityData,
          entityObjectId: val.id,
          entityType: entityType,
        }),
      ),
    );

    await CommunityActionPoints.addCommunityActionPoints({
      community: communityData.id,
    });
    this.client
      .send('addEmailTemplatesForCommunity', { community: communityData.id })
      .toPromise();
    return communityData;
  }

  /**
   * Update community
   */
  async updateCommunity(options: {}, data: {}): Promise<{}> {
    return this.communityRepository.update(options, data);
  }

  /**
   * Delete community
   */
  async deleteCommunity(options: {}): Promise<{}> {
    return this.communityRepository.delete(options);
  }

  /**
   * Get community's transformed url for both develop and prod environments.
   * @param communityId Community id.
   */
  async getTransformedUrl(communityId: number): Promise<string> {
    const community = await this.getOneCommunity({
      where: { id: communityId },
    });

    const clientPort = this.configService.getNumber('CLIENT_PORT');

    return `${community.url}${
      this.configService.getEnv() === ENVIRONMENTS.DEVELOP && clientPort
        ? `:${clientPort}`
        : ''
    }`;
  }

  async updateCommunityEmailTemplatesData(community) {
    await this.client
      .send('addEmailTemplatesForCommunity', { community: community })
      .toPromise();
    return true;
  }
}
