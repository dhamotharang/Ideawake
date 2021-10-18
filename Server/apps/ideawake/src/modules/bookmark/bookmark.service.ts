import { Injectable } from '@nestjs/common';

import { TABLES, ACTION_TYPES } from '../../common/constants/constants';
import { BookmarkEntity } from './bookmark.entity';
import { BookmarkRepository } from './bookmark.repository';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { UserBookmarks } from './user.bookmark.entity';
import { getRepository } from 'typeorm';

@Injectable()
export class BookmarkService {
  constructor(public readonly bookmarkRepository: BookmarkRepository) {}

  /**
   * Get Bookmarks
   */
  async getBookmarks(options: {}): Promise<BookmarkEntity[]> {
    return this.bookmarkRepository.find(options);
  }

  /**
   * Get user's bookmark
   * @param {string} user User id
   */
  async getUserBookmarks(userId, community: number): Promise<{}> {
    return this.bookmarkRepository
      .createQueryBuilder(TABLES.BOOKMARK)
      .innerJoinAndSelect(`${TABLES.BOOKMARK}.userBookmarks`, 'userBookmarks')
      .where('userBookmarks.userId=:user', { user: userId })
      .andWhere('bookmark.community = :community', { community })
      .getMany();
  }

  /**
   * Get bookmark by entity type
   * @param {Object} Opetions User id and entityTypeId
   * @returns List of bookmarks entities wise against a user
   */
  async getUserBookmarksByEntityType(options: {
    entityTypeId;
    userId;
    community: number;
  }): Promise<{}> {
    return this.bookmarkRepository
      .createQueryBuilder(TABLES.BOOKMARK)
      .leftJoinAndSelect(`${TABLES.BOOKMARK}.userBookmarks`, 'userBookmarks')
      .where(`${TABLES.BOOKMARK}.entityType = :entityTypeId`, {
        entityTypeId: options.entityTypeId,
      })
      .andWhere('userBookmarks.user = :userId', {
        userId: options.userId,
      })
      .andWhere('bookmark.community = :community', {
        community: options.community,
      })
      .getMany();
  }

  /**
   * Get bookmark counts entity wise
   * @param {Object} Opetions User id and entityTypeId
   * @returns Bookmark counts
   */
  async getBookmarkCounts(
    userId: string,
    entityTypeId?,
    entityObjectIds?,
    community?,
  ): Promise<{}> {
    return this.bookmarkRepository
      .createQueryBuilder(TABLES.BOOKMARK)
      .select([
        `${TABLES.BOOKMARK}.entityType`,
        `count(${TABLES.BOOKMARK}.entityType)`,
        `array_agg(${TABLES.BOOKMARK}.entityObjectId) as ids`,
      ])
      .leftJoin(`${TABLES.BOOKMARK}.userBookmarks`, 'userBookmarks')
      .where('userBookmarks.user = :userId', {
        userId: userId,
      })
      .andWhere(
        community ? `${TABLES.BOOKMARK}.community = :community` : `1=1`,
        {
          community: community,
        },
      )
      .andWhere(
        entityTypeId ? `${TABLES.BOOKMARK}.entityType = :entityType` : `1=1`,
        {
          entityType: entityTypeId,
        },
      )
      .andWhere(
        entityObjectIds
          ? `${TABLES.BOOKMARK}.entityObjectId IN (:...entityObjectIds)`
          : `1=1`,
        {
          entityObjectIds: entityObjectIds,
        },
      )
      .groupBy(`${TABLES.BOOKMARK}.entityType`)
      .getRawMany();
  }

  /**
   * Add Bookmark
   */
  async addBookmark(data: {}, actorData): Promise<BookmarkEntity> {
    const bookmarkCreated = this.bookmarkRepository.create(data);
    const bookmarkSaved = await this.bookmarkRepository.save(bookmarkCreated);
    NotificationHookService.notificationHook({
      actionData: bookmarkSaved,
      actorData: actorData,
      actionType: ACTION_TYPES.BOOKMARK,
    });
    return bookmarkSaved;
  }
  async addUserBookmarkContent(actorData, bookmarkId) {
    const userBookmarksRepo = getRepository(UserBookmarks);
    const createdData = await userBookmarksRepo.create({
      userId: actorData.id,
      bookmarkId: bookmarkId,
    });
    const savedUserBookmarkData = await userBookmarksRepo.save(createdData);
    const dataForBookmarkContentDetail: UserBookmarks = await userBookmarksRepo.findOne(
      {
        relations: ['bookmark', 'bookmark.entityType'],
        where: {
          bookmarkId: savedUserBookmarkData.bookmarkId,
        },
      },
    );
    NotificationHookService.notificationHook({
      actionData: {
        entityType: dataForBookmarkContentDetail.bookmark.entityType.id,
        entityObjectId: dataForBookmarkContentDetail.bookmark.entityObjectId,
      },
      actorData: actorData,
      actionType: ACTION_TYPES.BOOKMARK,
    });
  }
  /**
   * Update Bookmark
   */
  async updateBookmark(options: {}, data: {}): Promise<{}> {
    return this.bookmarkRepository.update(options, data);
  }

  /**
   * Delete Bookmark
   */
  async deleteBookmark(options: {}): Promise<{}> {
    return this.bookmarkRepository.delete(options);
  }

  /**
   * Get
   */
  async getUserBookmarksByEntityObjectId(entityObjectId, userId): Promise<{}> {
    return this.bookmarkRepository
      .createQueryBuilder(TABLES.BOOKMARK)
      .leftJoinAndSelect('bookmark.userBookmarks', 'userBookmarks')
      .where('bookmark.entityObjectId = :entityObjectId', {
        entityObjectId: entityObjectId,
      })
      .andWhere('userBookmarks.user = :userId', {
        userId: userId,
      })
      .getMany();
  }
}
