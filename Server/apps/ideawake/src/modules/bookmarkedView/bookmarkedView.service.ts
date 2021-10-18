import { Injectable } from '@nestjs/common';
import { BookmarkedViewRepository } from './bookmarkedView.repository';
import { BookmarkedViewEntity } from './bookmarkedView.entity';
import { In } from 'typeorm';
import { RoleService } from '../role/role.service';
import { EntityVisibilitySettingService } from '../entityVisibilitySetting/entityVisibilitySetting.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import {
  ENTITY_TYPES,
  PERMISSIONS_MAP,
  ROLE_ABBREVIATIONS,
} from '../../common/constants/constants';
import { difference, get, groupBy, head } from 'lodash';
import { CommunityService } from '../community/community.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { RoleActorTypes } from '../../enum';
import { UserCircleService } from '../user/userCircle.service';

@Injectable()
export class BookmarkedViewService {
  constructor(
    private readonly bookmarkedViewRepository: BookmarkedViewRepository,
    private readonly roleService: RoleService,
    private readonly entityVisibilitySettingService: EntityVisibilitySettingService,
    private readonly communityService: CommunityService,
    private readonly roleActorsService: RoleActorsService,
    private readonly userCircleService: UserCircleService,
  ) {}

  /**
   * Get Bookmarked Views
   * @param options Options to find.
   */
  async getBookmarkedViews(options: {}): Promise<BookmarkedViewEntity[]> {
    return this.bookmarkedViewRepository.find(options);
  }

  /**
   * Get Bookmarked Views with Filters.
   * @param options Options to find.
   */
  async getBookmarkedViewsWithFilters(options: {
    community: number;
    isDeleted?: boolean;
    searchText?: string;
  }): Promise<BookmarkedViewEntity[]> {
    const query = this.bookmarkedViewRepository
      .createQueryBuilder('bookmark')
      .where('bookmark.community = :community', {
        community: options.community,
      });

    if (Object.keys(options).includes('isDeleted')) {
      query.andWhere('bookmark.isDeleted = :isDeleted', {
        isDeleted: options.isDeleted,
      });
    }
    if (options.searchText) {
      query.andWhere('bookmark.title ILIKE :searchText', {
        searchText: `%${options.searchText}%`,
      });
    }

    return query.orderBy('bookmark.title', 'ASC').getMany();
  }

  /**
   * Get Single Bookmarked View.
   * @param options Options to find.
   */
  async getBookmarkedView(options: {}): Promise<BookmarkedViewEntity> {
    return this.bookmarkedViewRepository.findOne(options);
  }

  /**
   * Get Single Bookmarked View with Visibility Settings
   * @param options Options to find.
   */
  async getBookmarkedViewWithSettings(options: {}): Promise<{}> {
    // Find bookmarked view.
    const bookmark = await this.getBookmarkedView(options);

    // Get visibility settings for the bookmarked view found.
    if (bookmark) {
      const bookmarkEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.BOOKMARKED_VIEW,
      );
      const entityVisSettings = await this.entityVisibilitySettingService.getEntityVisibilitySetting(
        {
          entityType: bookmarkEntityType.id,
          entityObjectId: bookmark.id,
          community: bookmark.communityId,
        },
      );

      bookmark['visibilitySettings'] = {
        public: entityVisSettings.public || false,
        private: get(entityVisSettings, 'roles.length') ? true : false,
        groups: entityVisSettings.groups || [],
        individuals: entityVisSettings.individuals || [],
      };
    }

    return bookmark;
  }

  /**
   * Add a Bookmarked View.
   * @param data Data to add.
   */
  async addBookmarkedView(data: {}): Promise<BookmarkedViewEntity> {
    const bookmarkedViewCreated = this.bookmarkedViewRepository.create({
      ...data,
      isDeleted: false,
    });
    return this.bookmarkedViewRepository.save(bookmarkedViewCreated);
  }

  /**
   * Update a Bookmarked View
   * @param options Options to find.
   * @param data Updated Data.
   */
  async updateBookmarkedView(options: {}, data: {}): Promise<{}> {
    return this.bookmarkedViewRepository.update(options, data);
  }

  /**
   * Creates required entity visibility settings data according to the given
   * visibility settings.
   * @param visibilitySettings Visibility Settings.
   * @param community Community Id.
   */
  async createVisibilityPermData(
    visibilitySettings: {},
    community: number,
  ): Promise<{}> {
    const visibilityData = {
      roles: [],
      groups: [],
      individuals: [],
      public: false,
    };
    if (visibilitySettings['public']) {
      visibilityData.public = true;
    } else if (visibilitySettings['private']) {
      const privateRoles = await this.roleService.getRoles({
        where: {
          abbreviation: In([
            ROLE_ABBREVIATIONS.ADMIN,
            ROLE_ABBREVIATIONS.MODERATOR,
          ]),
          community,
        },
      });
      visibilityData.roles = privateRoles.map(role => role.id);
    } else if (
      get(visibilitySettings, 'groups.length') ||
      get(visibilitySettings, 'individuals.length')
    ) {
      visibilityData.groups = visibilitySettings['groups'] || [];
      visibilityData.individuals = visibilitySettings['individuals'] || [];
    } else {
      // If nothing selected, defaults to public.
      visibilityData.public = true;
    }
    return visibilityData;
  }

  /**
   * Saves the visibility settings for a bookmarked view.
   * @param visibilitySettings Visibility Settings
   * @param bookmarkId Bookmark's Id for which the settings need to be saved.
   * @param communityId Community Id of the bookmark.
   */
  async saveBookmarkedViewVisSettings(
    visibilitySettings: {},
    bookmarkId: number,
    communityId: number,
  ): Promise<{}> {
    const bookmarkEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.BOOKMARKED_VIEW,
    );

    const visibilityData = await this.createVisibilityPermData(
      visibilitySettings,
      communityId,
    );

    return this.entityVisibilitySettingService.addEntityVisibilitySetting({
      entityType: bookmarkEntityType.id,
      entityObjectId: bookmarkId,
      community: communityId,
      ...visibilityData,
    });
  }

  /**
   * Get Permissions for the given bookmarked view ids.
   * @param bookmarkIds Bookmark Ids for which the permissions need to be fetched.
   * @param communityId Community Id of the user.
   * @param userId User Id.
   */
  async getBookmarkedViewsPermissions(
    bookmarkIds: number[],
    communityId: number,
    userId: number,
  ): Promise<
    {
      bookmarkedViewId: number;
      viewBookmarkedView: number;
      manageBookmarkedView: number;
    }[]
  > {
    let permissions = [];
    if (bookmarkIds.length) {
      const bookmarkEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.BOOKMARKED_VIEW,
      );
      const bookmarkedViews = await this.getBookmarkedViews({
        where: { id: In(bookmarkIds), community: communityId },
      });

      // Calculate bookmarked views permissions if any bookmark found.
      if (bookmarkedViews.length) {
        const [
          visSettings,
          communityPerm,
          roleActors,
          userGroups,
        ] = await Promise.all([
          this.entityVisibilitySettingService.getEntityVisibilitySettings({
            entityType: bookmarkEntityType.id,
            entityObjectId: In(bookmarkIds),
          }),
          this.communityService.getPermissions(communityId, userId),
          this.roleActorsService.getRoleActors({
            where: {
              entityObjectId: null,
              entityType: null,
              actorId: userId,
              actorType: RoleActorTypes.USER,
              community: communityId,
            },
          }),
          this.userCircleService.getUserCircles({
            where: { user: userId },
          }),
        ]);
        const visSettingsGrouped = groupBy(visSettings, 'entityObjectId');
        const roleIds = roleActors.map(actor => actor.roleId);
        const groupIds = userGroups.map(userGroup => userGroup.circleId);

        permissions = bookmarkedViews.map(bookmark => {
          // Allow the user to manage the bookmarked view if he//she owns it.
          const perm = {
            bookmarkedViewId: bookmark.id,
            viewBookmarkedView:
              communityPerm.viewBookmarkedView === PERMISSIONS_MAP.ALLOW ||
              bookmark.userId === userId
                ? PERMISSIONS_MAP.ALLOW
                : communityPerm.viewBookmarkedView,
            manageBookmarkedView:
              communityPerm.manageBookmarkedView === PERMISSIONS_MAP.ALLOW ||
              bookmark.userId === userId
                ? PERMISSIONS_MAP.ALLOW
                : PERMISSIONS_MAP.DENY,
          };

          // Find user's visibility permission for the respective bookmarked view.
          if (perm.viewBookmarkedView === PERMISSIONS_MAP.SCENARIO) {
            const visibility = head(visSettingsGrouped[bookmark.id]);

            if (
              visibility.public ||
              bookmark.userId === userId ||
              (visibility.individuals &&
                visibility.individuals.includes(userId)) ||
              (visibility.groups &&
                difference(visibility.groups, groupIds).length <
                  visibility.groups.length) ||
              (visibility.roles &&
                difference(visibility.roles, roleIds).length <
                  visibility.roles.length)
            ) {
              perm.viewBookmarkedView = PERMISSIONS_MAP.ALLOW;
            } else {
              perm.viewBookmarkedView = PERMISSIONS_MAP.DENY;
            }
          }

          return perm;
        });
      }
    }

    return permissions;
  }

  /**
   * Updates the visibility settings of a bookmarked view.
   * @param visibilitySettings Visibility Settings
   * @param bookmarkId Bookmark's Id for which the settings need to be saved.
   * @param communityId Community Id of the bookmark.
   */
  async updateBookmarkedViewVisibility(
    visibilitySettings: {},
    bookmarkId: number,
    communityId: number,
  ): Promise<{}> {
    const visibilityData = await this.createVisibilityPermData(
      visibilitySettings,
      communityId,
    );

    const bookmarkEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.BOOKMARKED_VIEW,
    );

    return this.entityVisibilitySettingService.updateEntityVisibilitySetting(
      {
        entityType: bookmarkEntityType.id,
        entityObjectId: bookmarkId,
        community: communityId,
      },
      visibilityData,
    );
  }

  /**
   * Soft Delete a Bookmarked View.
   * @param options Options to find.
   */
  async deleteBookmarkedView(options: {}): Promise<{}> {
    return this.updateBookmarkedView(options, { isDeleted: true });
  }
}
