import { flatten, Injectable } from '@nestjs/common';
import { OpportunityUserRepository } from './opportunityUser.repository';
import { OpportunityUserEntity } from './opportunityUser.entity';
import { OpportunityUserType } from '../../enum/opportunity-user-type.enum';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { RoleService } from '../role/role.service';
import { RolesEnum } from '../../enum/roles.enum';
import { RoleActorTypes } from '../../enum';
import { EntityTypeService } from '../entityType/entity.service';
import * as _ from 'lodash';
import { ACTION_TYPES, ENTITY_TYPES } from '../../common/constants/constants';
import { In, Not } from 'typeorm';

import { NotificationHookService } from '../../shared/services/notificationHook';
import { UserEntity } from '../user/user.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { OpportunityTypeService } from '../opportunityType/opportunityType.service';
import { OpportunityRepository } from '../opportunity/opportunity.repository';
import { EntityExperienceSettingEntity } from '../entityExperienceSetting/entityExperienceSetting.entity';

@Injectable()
export class OpportunityUserService {
  private operationType = { add: 'add', remove: 'remove' };
  constructor(
    public readonly opportunityUserRepository: OpportunityUserRepository,
    public readonly roleActorsService: RoleActorsService,
    public readonly roleService: RoleService,
    public readonly entityTypeService: EntityTypeService,
    public readonly opportunityTypeService: OpportunityTypeService,
    public readonly opportunityRepository: OpportunityRepository,
  ) {}

  /**
   * Get opportunityUsers
   */
  async getOpportunityUsers(options: {}): Promise<OpportunityUserEntity[]> {
    return this.opportunityUserRepository.find(options);
  }

  /**
   * Get opportunityUsers
   */
  async getOpportunityUsersWithUserRoles(options: {}): Promise<
    OpportunityUserEntity[]
  > {
    const oppUsers = await this.getOpportunityUsers(options);

    if (oppUsers && oppUsers.length) {
      const roleActors = await this.roleActorsService.getRoleActors({
        where: {
          entityObjectId: null,
          entityType: null,
          actorId: In(oppUsers.map(oppUser => oppUser.userId)),
          actorType: RoleActorTypes.USER,
          community: oppUsers[0].communityId,
        },
        relations: ['role'],
      });
      const roleActorsGrouped = _.groupBy(roleActors, 'actorId');
      for (const oppUser of oppUsers) {
        oppUser.user['role'] =
          roleActorsGrouped && roleActorsGrouped[oppUser.userId]
            ? _.head(roleActorsGrouped[oppUser.userId]).role
            : {};
      }
    }

    return oppUsers;
  }

  /**
   * Add opportunityUser
   */
  async addOpportunityUser(
    data: {}[],
    actorData,
    generateNotification = true,
  ): Promise<OpportunityUserEntity[]> {
    const opportunityUserCreated: OpportunityUserEntity[] = this.opportunityUserRepository.create(
      data,
    );
    const opportunityUsersAdded: OpportunityUserEntity[] = await this.opportunityUserRepository.save(
      opportunityUserCreated,
    );
    const ids = _.map(opportunityUsersAdded, 'id');
    const finalAddedData = await this.opportunityUserRepository.find({
      where: { id: In(ids) },
      relations: ['user', 'opportunity', 'community'],
    });
    const previousUsers = await this.opportunityUserRepository.find({
      where: {
        opportunity: _.head(opportunityUsersAdded).opportunity,
        id: Not(In(ids)),
        user: Not(In(finalAddedData.map(val => val.user.id))),
      },
      relations: ['user', 'opportunity', 'community'],
    });
    const groupedData = _.groupBy(previousUsers, 'opportunityUserType');

    // assign users required roles
    const entityType = await this.getOpportunityEntityType();
    const userRoleActors = await this.getOppUserRoleActors(
      finalAddedData,
      entityType,
    );
    await this.roleActorsService.addRoleActors(userRoleActors);

    // generate notification
    if (generateNotification) {
      actorData['community'] = _.head(finalAddedData).community.id;

      _.map(finalAddedData, val => {
        val['entityObjectId'] = val.opportunity.id;
        val['entityType'] = entityType['id'];
        const actionType = this.getActionType(
          val['opportunityUserType'],
          this.operationType.add,
        );

        const entityOperendObject = {
          userId: val.user.id,
          userName: val.user.firstName + ' ' + val.user.lastName,
          message: val.message,
        };

        NotificationHookService.notificationHook({
          actionData: val,
          actorData: actorData,
          actionType: actionType,
          invertUser: true,
          entityOperendObject,
        });

        const relatedUsers = this.getActionTypeNotifiers(
          actionType,
          groupedData,
        );

        _.map(relatedUsers, valUser => {
          const valCopy = _.cloneDeep(val);
          delete valCopy.user;
          valCopy['user'] = _.cloneDeep(valUser);

          NotificationHookService.notificationHook({
            actionData: valCopy,
            actorData: actorData,
            actionType: actionType,
            isActivity: false,
            invertUser: true,
            entityOperendObject,
          });
        });
      });
    }

    return opportunityUsersAdded;
  }

  /**
   * Add opportunityUser while checking opportunity type's experience settings.
   */
  async addOpportunityUserWithSetting(
    data: {}[],
    actorData,
    generateNotification = true,
  ): Promise<OpportunityUserEntity[]> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: data[0]['opportunity'] },
      relations: ['opportunityType'],
    });
    const expSettings = (await this.opportunityTypeService.getOpportunityTypeExperienceSettings(
      {
        id: opportunity.opportunityType.id,
      },
    )) as EntityExperienceSettingEntity;

    const newUsers = [];
    for (const user of data) {
      if (user['opportunityUserType'] === OpportunityUserType.SUBMITTER) {
        newUsers.push(
          this.createUserByExperienceSetting(
            user,
            OpportunityUserType.CONTRIBUTOR,
            expSettings.assignOpportunitySubmitterAsContributor,
          ),
        );
        newUsers.push(
          this.createUserByExperienceSetting(
            user,
            OpportunityUserType.OWNER,
            expSettings.assignOpportunitySubmitterAsOwner,
          ),
        );
      }
    }
    data = data.concat(
      (await Promise.all(newUsers)).filter(user => !_.isEmpty(user)),
    );

    return this.addOpportunityUser(data, actorData, generateNotification);
  }

  /**
   * Creates a new user with the given type based upon experience settings.
   * @param user User to duplicate.
   * @param type New User Type.
   * @param condition Condition on which to decide weather to duplicate or not.
   */
  async createUserByExperienceSetting(
    user: {},
    type: string,
    condition,
  ): Promise<{}> {
    let newUser = {};
    if (condition) {
      // if new user already exists return empty otherwise return the new one
      newUser = (await this.opportunityUserRepository.findOne({
        where: { ...user, opportunityUserType: type },
      }))
        ? {}
        : { ...user, opportunityUserType: type };
    }
    return newUser;
  }

  /**
   * Update opportunityUser
   */
  async updateOpportunityUser(options: {}, data: {}): Promise<{}> {
    return this.opportunityUserRepository.update(options, data);
  }

  /**
   * Delete opportunityUser
   */

  async deleteOpportunityUser(
    options: { id: number; community },
    actorData,
  ): Promise<{}> {
    const dataToDelete = await this.opportunityUserRepository.findOne({
      where: { id: options.id, community: options.community },
      relations: ['user', 'opportunity', 'community'],
    });

    // remove users' assigned roles
    const entityType = await this.getOpportunityEntityType();
    const userRoleActors = await this.getOppUserRoleActors(
      [dataToDelete],
      entityType,
    );
    const actorsToDelete = (await this.roleActorsService.getRoleActors({
      where: userRoleActors,
    })).map(actor => actor.id);
    await this.roleActorsService.deleteRoleActors(actorsToDelete);

    // generate notification
    const previousUsers = await this.opportunityUserRepository.find({
      where: {
        opportunity: dataToDelete.opportunity,
        id: Not(In([options.id])),
        user: Not(In([dataToDelete.user.id])),
      },
      relations: ['user', 'opportunity', 'community'],
    });
    const groupedData = _.groupBy(previousUsers, 'opportunityUserType');

    dataToDelete['entityObjectId'] = dataToDelete.opportunity.id;
    dataToDelete['entityType'] = entityType['id'];
    actorData['community'] = dataToDelete.community.id;
    const actionType = this.getActionType(
      dataToDelete.opportunityUserType,
      this.operationType.remove,
    );

    NotificationHookService.notificationHook({
      actionData: dataToDelete,
      actorData: actorData,
      actionType: actionType,
      invertUser: true,
    });

    const relatedUsers = this.getActionTypeNotifiers(actionType, groupedData);
    const entityOperendObject = {
      userId: dataToDelete.user.id,
      userName: dataToDelete.user.firstName + ' ' + dataToDelete.user.lastName,
    };
    _.map(relatedUsers, valUser => {
      const valCopy = _.cloneDeep(dataToDelete);
      delete valCopy.user;
      valCopy['user'] = _.cloneDeep(valUser);

      NotificationHookService.notificationHook({
        actionData: valCopy,
        actorData: actorData,
        actionType: actionType,
        invertUser: true,
        entityOperendObject,
        isActivity: false,
      });
    });

    return this.opportunityUserRepository.delete(options);
  }

  /**
   * Get EntityType for Opportunity.
   * @returns EntityTypeEntity object.
   */
  async getOpportunityEntityType(): Promise<EntityTypeEntity> {
    return (await this.entityTypeService.getEntityTypes({
      where: {
        abbreviation: ENTITY_TYPES.IDEA,
      },
    }))[0];
  }

  /**
   * Map OpportunityUsers to RoleActors.
   * @param opportunityUsers Users to map.
   * @param entityType Opportunity Entity Type.
   * @returns Mapped RoleActors.
   */
  async getOppUserRoleActors(
    opportunityUsers: OpportunityUserEntity[],
    entityType: EntityTypeEntity,
  ): Promise<{}> {
    // get related roles
    const reqRoles = _.groupBy(
      await this.roleService.getRoles({
        where: {
          title: In([
            RolesEnum.opportunityOwner,
            RolesEnum.opportunityContributor,
            RolesEnum.opportunitySubmitter,
          ]),
          community: opportunityUsers[0].communityId,
        },
      }),
      'title',
    );

    // return role actors
    return opportunityUsers.map(oppUser => {
      return {
        role: reqRoles[this.getRoleUserType(oppUser.opportunityUserType)][0],
        actorType: RoleActorTypes.USER,
        actorId: oppUser.userId,
        entityObjectId: oppUser.opportunityId,
        entityType: entityType,
        community: oppUser.communityId,
      };
    });
  }

  /**
   * Maps OpportunityUserType Enum to RolesEnum.
   * @param opportunityUserType User type from OpportunityUserType Enum.
   * @returns Mapped RolesEnum value.
   */
  getRoleUserType(opportunityUserType): string {
    return {
      [OpportunityUserType.OWNER]: RolesEnum.opportunityOwner,
      [OpportunityUserType.CONTRIBUTOR]: RolesEnum.opportunityContributor,
      [OpportunityUserType.SUBMITTER]: RolesEnum.opportunitySubmitter,
    }[opportunityUserType];
  }

  getActionType(opportunityUserType, type) {
    const dataMapper = {
      [OpportunityUserType.OWNER +
      this.operationType.add]: ACTION_TYPES.ADD_OWNER,
      [OpportunityUserType.OWNER +
      this.operationType.remove]: ACTION_TYPES.REMOVE_OWNER,
      [OpportunityUserType.CONTRIBUTOR +
      this.operationType.add]: ACTION_TYPES.ADD_CONTRIBUTOR,
      [OpportunityUserType.CONTRIBUTOR +
      this.operationType.remove]: ACTION_TYPES.REMOVE_CONTRIBUTOR,
      [OpportunityUserType.SUBMITTER +
      this.operationType.add]: ACTION_TYPES.ADD_SUBMITTER,
      [OpportunityUserType.SUBMITTER +
      this.operationType.remove]: ACTION_TYPES.REMOVE_SUBMITTER,
    };
    return dataMapper[opportunityUserType + type];
  }
  getActionTypeNotifiers(actionType, userGroupedByType): UserEntity[] {
    const dataMapper = {
      [ACTION_TYPES.ADD_OWNER]: [OpportunityUserType.SUBMITTER],
      [ACTION_TYPES.REMOVE_OWNER]: [OpportunityUserType.SUBMITTER],
      [ACTION_TYPES.ADD_CONTRIBUTOR]: [OpportunityUserType.CONTRIBUTOR],
      [ACTION_TYPES.REMOVE_CONTRIBUTOR]: [OpportunityUserType.CONTRIBUTOR],
      [ACTION_TYPES.ADD_SUBMITTER]: [OpportunityUserType.SUBMITTER],
      [ACTION_TYPES.REMOVE_SUBMITTER]: [OpportunityUserType.SUBMITTER],
    };
    const toFind = dataMapper[actionType];
    let foundUserArray = [];
    _.map(userGroupedByType, (_val, key) => {
      if (_.indexOf(toFind, key) !== -1) {
        foundUserArray.push(_.flatMap(_.map(userGroupedByType[key], 'user')));
      }
    });
    foundUserArray = _.flatMap(foundUserArray);
    return foundUserArray;
  }

  /**
   * Add bulk opportunity user.
   */
  async bulkAddOpportunityUser(
    data,
    actorData,
    generateNotification = true,
  ): Promise<OpportunityUserEntity[]> {
    const opportunityUserCreated: OpportunityUserEntity[] = this.opportunityUserRepository.create(
      data,
    );
    const opportunityUsersAdded: OpportunityUserEntity[] = await this.opportunityUserRepository.save(
      opportunityUserCreated,
    );
    const ids = _.map(opportunityUsersAdded, 'id');

    if (ids.length !== 0 && generateNotification) {
      const finalAddedData = await this.opportunityUserRepository.find({
        where: {
          id: In(ids),
        },
        relations: ['user', 'opportunity', 'community'],
      });
      const previousUsers = await this.opportunityUserRepository.find({
        where: {
          opportunity: _.head(opportunityUsersAdded).opportunity,
          id: Not(In(ids)),
          user: Not(In(finalAddedData.map(val => val.user.id))),
        },
        relations: ['user', 'opportunity', 'community'],
      });
      const groupedData = _.groupBy(previousUsers, 'opportunityUserType');

      // assign users required roles
      const entityType = await this.getOpportunityEntityType();
      const userRoleActors = await this.getOppUserRoleActors(
        finalAddedData,
        entityType,
      );
      await this.roleActorsService.addRoleActors(userRoleActors);

      actorData['community'] = _.head(finalAddedData).community.id;

      _.map(finalAddedData, val => {
        val['entityObjectId'] = val.opportunity.id;
        val['entityType'] = entityType['id'];
        const actionType = this.getActionType(
          val['opportunityUserType'],
          this.operationType.add,
        );

        const entityOperendObject = {
          userId: val.user.id,
          userName: val.user.firstName + ' ' + val.user.lastName,
          message: val.message,
        };

        NotificationHookService.notificationHook({
          actionData: val,
          actorData: actorData,
          actionType: actionType,
          isEmail: false,
          isActivity: true,
          invertUser: true,
          entityOperendObject,
        });

        const relatedUsers = this.getActionTypeNotifiers(
          actionType,
          groupedData,
        );

        _.map(relatedUsers, valUser => {
          const valCopy = _.cloneDeep(val);
          delete valCopy.user;
          valCopy['user'] = _.cloneDeep(valUser);

          NotificationHookService.notificationHook({
            actionData: valCopy,
            actorData: actorData,
            actionType: actionType,
            isEmail: false,
            isActivity: false,
            invertUser: true,
            entityOperendObject,
          });
        });
      });
    }
    return opportunityUsersAdded;
  }

  /**
   * Add bulk opportunity user while checking opportunity's already existing users and opportunity type's experience settings.
   */
  async bulkAddOpportunityUserWithSetting(
    data,
    actorData,
    generateNotification = true,
  ): Promise<OpportunityUserEntity[]> {
    const opportunity = await this.opportunityRepository.find({
      where: { id: In(data.opportunityIds) },
      relations: ['opportunityType'],
    });

    let userDataToBeUpdated = [];
    const opportunityTypeEntities = _.map(opportunity, 'opportunityType');

    const expSettings = (await this.opportunityTypeService.getBulkOpportunityTypeExperienceSettings(
      {
        opportunityTypes: opportunityTypeEntities.map(val => val['id']),
        community: actorData['currentCommunity'],
      },
    )) as EntityExperienceSettingEntity;

    const newUsers = [];
    const userType = data.users[0].opportunityUserType;

    const existingUsers = await this.getOpportunityUsers({
      where: {
        opportunity: In(data.opportunityIds),
        opportunityUserType: userType,
        userId: data.users.map(val => val['user']),
        community: actorData['currentCommunity'],
      },
    });

    const groupedDiffUsers = _.groupBy(existingUsers, 'opportunityId');

    let differentUsers;
    const userIds = data.users.map(id => id.user);

    _.forEach(data.opportunityIds, key => {
      const user = _.get(groupedDiffUsers, key, []);
      const ids = _.map(user, val => val.userId);
      differentUsers = userIds.filter(val => !ids.includes(val));

      userDataToBeUpdated = [
        ...userDataToBeUpdated,
        differentUsers.map(diffUser => {
          return {
            user: diffUser,
            opportunity: parseInt(key),
            community: actorData['currentCommunity'],
            opportunityUserType: userType,
          };
        }),
      ];
    });

    userDataToBeUpdated = flatten(userDataToBeUpdated);

    if (expSettings) {
      data.users.map(async user => {
        newUsers.push(
          this.createUserByExperienceSetting(
            user,
            OpportunityUserType.CONTRIBUTOR,
            expSettings.assignOpportunitySubmitterAsContributor,
          ),
        );
        newUsers.push(
          this.createUserByExperienceSetting(
            user,
            OpportunityUserType.OWNER,
            expSettings.assignOpportunitySubmitterAsOwner,
          ),
        );

        userDataToBeUpdated = userDataToBeUpdated.concat(
          (await Promise.all(newUsers)).filter(user => !_.isEmpty(user)),
        );
      });
    }

    return this.bulkAddOpportunityUser(
      userDataToBeUpdated,
      actorData,
      generateNotification,
    );
  }
}
