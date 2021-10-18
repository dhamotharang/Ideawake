import { Injectable } from '@nestjs/common';
import { RoleActorsRepository } from './roleActors.repository';
import { RoleActorsEntity } from './roleActors.entity';
import { RoleActorTypes } from '../../enum';
import { CommunityWisePermissionService } from '../communityWisePermission/communityWisePermission.service';
import { CommunityWisePermissionEntity } from '../communityWisePermission/communityWisePermission.entity';
import { UserCircleService } from '../user/userCircle.service';
import { In } from 'typeorm';
import { cloneDeep, compact, get, groupBy, head, uniq } from 'lodash';
import { UtilsService } from '../../providers/utils.service';

@Injectable()
export class RoleActorsService {
  constructor(
    public readonly roleActorsRepository: RoleActorsRepository,
    private readonly userCircleService: UserCircleService,
    private readonly communityWisePermissionService: CommunityWisePermissionService,
  ) {}

  /**
   * Get roleActors
   */
  async getRoleActors(options: {}): Promise<RoleActorsEntity[]> {
    return this.roleActorsRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'roleActor',
        ),
      }),
    });
  }

  /**
   * Get single roleActor.
   */
  async getRoleActor(options: {}): Promise<RoleActorsEntity> {
    return this.roleActorsRepository.findOne({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'roleActor',
        ),
      }),
    });
  }

  async getActorEntityRoles(
    actorType: string,
    actorId: number,
    entityObjectId: number,
    entityType: number,
    community: number,
  ): Promise<RoleActorsEntity[]> {
    const roleActors = await this.getRoleActors({
      where: {
        actorId,
        actorType,
        entityObjectId,
        entityTypeId: entityType,
        communityId: community,
      },
      relations: ['role'],
    });
    return roleActors;
  }

  async getMyEntityRoles(
    entityObjectId: number,
    entityType: number,
    community: number,
    options: {},
  ): Promise<RoleActorsEntity[]> {
    const actors = await this.getMyEntityActors(
      entityObjectId,
      entityType,
      community,
      options,
    );
    const roleActors = await this.getRoleActors({
      where: actors,
      relations: ['role'],
    });
    return roleActors;
  }

  async getActorsEntityPermissions(
    actors: {}[],
    community: number,
  ): Promise<CommunityWisePermissionEntity> {
    let actorRoles = [];
    if (actors.length > 0) {
      actorRoles = (await this.roleActorsRepository.find({
        where: UtilsService.replaceJoinColumnsForQueries(actors, 'roleActor'),
      })).map(roleActor => {
        return {
          role: roleActor.roleId,
          community,
        };
      });
    }

    const permissions = await this.communityWisePermissionService.getDeniedPermissions();
    if (actorRoles.length > 0) {
      const savedPermissions = await this.communityWisePermissionService.getCommunityWisePermissions(
        {
          where: actorRoles,
          // relations: ['role'],
        },
      );
      if (savedPermissions.length > 0) {
        for (const permProperty of Object.getOwnPropertyNames(permissions)) {
          for (const perm of savedPermissions) {
            permissions[permProperty] = Math.max(
              permissions[permProperty],
              perm[permProperty],
            );
          }
        }
      }
    }

    return permissions;
  }

  /**
   * Get entity role actors for a user in bulk.
   * @param entityObjectIds Entity Object Ids for which to get role actors for.
   * @param entityType Entity type for the given object ids.
   * @param community Community of the user.
   * @param userId User id.
   */
  async getEntityRoleActorsBulk(
    entityObjectIds: number[],
    entityType: number,
    community: number,
    userId: number,
  ): Promise<RoleActorsEntity[]> {
    // Map user to actors for user and his groups.
    const actors = [
      {
        actorId: userId,
        actorType: RoleActorTypes.USER,
        community,
      },
    ].concat(
      (await this.userCircleService.getUserCircles({
        where: { user: userId },
      })).map(userCircle => {
        return {
          actorId: userCircle.circleId,
          actorType: RoleActorTypes.GROUP,
          community,
        };
      }),
    );

    // Get role actors for the user.
    return this.getRoleActors({
      where: actors.map(actor => ({
        ...actor,
        entityType,
        entityObjectId: In(entityObjectIds),
      })),
    });
  }

  /**
   * Get Actor's Entity Permissions
   */
  async getActorEntityPermissions(
    actorType: string,
    actorId: number,
    entityObjectId: number,
    entityType: number,
    community: number,
  ): Promise<CommunityWisePermissionEntity> {
    return this.getActorsEntityPermissions(
      [{ actorId, actorType, entityObjectId, entityType, community }],
      community,
    );
  }

  /**
   * Get entity permissions in bulk.
   * @param entityObjectIds Entity Object Ids for which to get permissions for.
   * @param entityType Entity type for the given object ids.
   * @param community Community of the user.
   * @param userId User id.
   */
  async getEntityPermissionsBulk(
    entityObjectIds: number[],
    entityType: number,
    community: number,
    userId: number,
  ): Promise<
    { permissions: CommunityWisePermissionEntity; entityObjectId: number }[]
  > {
    // Get role actors for the given ids and user.
    const roleActors = await this.getEntityRoleActorsBulk(
      entityObjectIds,
      entityType,
      community,
      userId,
    );
    const roleIds = uniq(roleActors.map(roleActor => roleActor.roleId));
    const roleActorsGrouped = groupBy(roleActors, 'entityObjectId');

    // Get denied permissions for falure cases.
    const deniedPerm = await this.communityWisePermissionService.getDeniedPermissions();

    // Get permissions for user's role actors.
    let permsGrouped = {};
    if (roleIds.length) {
      const perms = await this.communityWisePermissionService.getCommunityWisePermissions(
        {
          where: {
            role: In(roleIds),
            community,
          },
        },
      );
      permsGrouped = groupBy(perms, 'roleId');
    }

    // Map and return permissions.
    return entityObjectIds.map(id => {
      const actors: RoleActorsEntity[] = get(roleActorsGrouped, id, []);
      const permissions = cloneDeep(deniedPerm);

      if (actors.length) {
        const rolePerm = compact(
          actors.map(actor => head(get(permsGrouped, actor.roleId))),
        );

        for (const permProperty of Object.getOwnPropertyNames(permissions)) {
          permissions[permProperty] = Math.max(
            permissions[permProperty],
            ...rolePerm.map(perm => perm[permProperty]),
          );
        }
      }

      return {
        entityObjectId: id,
        permissions,
      };
    });
  }

  async getMyEntityActors(
    entityObjectId: number,
    entityType: number,
    community: number,
    options: {},
  ): Promise<{}[]> {
    const actors = (await this.userCircleService.getUserCircles({
      where: { user: options['userId'] },
    })).map(userCircle => {
      return {
        actorId: userCircle.circleId,
        actorType: RoleActorTypes.GROUP,
        entityObjectId,
        entityType,
        community,
      };
    });

    actors.push({
      actorId: options['userId'],
      actorType: RoleActorTypes.USER,
      entityObjectId,
      entityType,
      community,
    });
    return actors;
  }

  /**
   * Get Entity Permissions
   */
  async getEntityPermissions(
    entityObjectId: number,
    entityType: number,
    community: number,
    options: {},
  ): Promise<CommunityWisePermissionEntity> {
    const actors = await this.getMyEntityActors(
      entityObjectId,
      entityType,
      community,
      options,
    );
    return this.getActorsEntityPermissions(actors, community);
  }

  /**
   * Add roleActors
   */
  async addRoleActors(data: {}): Promise<RoleActorsEntity> {
    const roleActorsCreated = this.roleActorsRepository.create(
      UtilsService.replaceJoinColumnsForQueries(data, 'roleActor'),
    );
    return this.roleActorsRepository.save(roleActorsCreated);
  }

  /**
   * Add or update roleActors
   */
  async addOrUpdateRoleActors(options: {}, data: {}): Promise<{}> {
    const roleActor = await this.getRoleActor({ where: options });
    if (roleActor) {
      return this.updateRoleActors(options, data);
    } else {
      return this.addRoleActors(data);
    }
  }

  /**
   * Update roleActors
   */
  async updateRoleActors(options: {}, data: {}): Promise<{}> {
    return this.roleActorsRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'roleActor'),
      UtilsService.replaceJoinColumnsForQueries(data, 'roleActor'),
    );
  }

  /**
   * Hard Delete roleActors
   */
  async deleteRoleActors(options: {}): Promise<{}> {
    return this.roleActorsRepository.delete(
      UtilsService.replaceJoinColumnsForQueries(options, 'roleActor'),
    );
  }
}
