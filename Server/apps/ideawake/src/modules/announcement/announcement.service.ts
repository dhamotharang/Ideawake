import { Injectable } from '@nestjs/common';
import { AnnouncementRepository } from './announcement.repository';
import { AnnouncementEntity } from './announcement.entity';
import { flatten, get, groupBy, keyBy, map, max, uniq } from 'lodash';
import { AddAnnouncementDto } from './dto';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import {
  ENTITY_TYPES,
  ENVIRONMENTS,
  PERMISSIONS_MAP,
} from '../../common/constants/constants';
import { AnnouncementTargetingService } from './announcementTargeting.service';
import { AnnouncementAttachmentService } from './announcementAttachment.service';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { AnnouncementStatuses } from '../../enum';
import { ConfigService } from '../../shared/services/config.service';
import { CommunityService } from '../community/community.service';

@Injectable()
export class AnnouncementService {
  private configService = new ConfigService();

  constructor(
    public readonly announcementRepository: AnnouncementRepository,
    private announcementTargetingService: AnnouncementTargetingService,
    private announcementAttachmentService: AnnouncementAttachmentService,
    private entityExperienceSettingService: EntityExperienceSettingService,
    private roleActorService: RoleActorsService,
    private readonly communityService: CommunityService,
  ) {}

  /**
   * Get raw Announcements
   */
  async getRawAnnouncements(
    options: FindManyOptions<AnnouncementEntity>,
  ): Promise<AnnouncementEntity[]> {
    return this.announcementRepository.find(options);
  }

  async getRawAnnouncementsWithCount(
    options: FindManyOptions<AnnouncementEntity>,
  ): Promise<[AnnouncementEntity[], number]> {
    return this.announcementRepository.findAndCount(options);
  }

  /**
   * Get single raw Announcements
   */
  async getRawAnnouncement(
    options: FindOneOptions<AnnouncementEntity>,
  ): Promise<AnnouncementEntity> {
    return this.announcementRepository.findOne(options);
  }

  /**
   * Get single Announcement
   */
  async getAnnouncement(
    options: FindOneOptions<AnnouncementEntity>,
  ): Promise<AnnouncementEntity> {
    const announcement = await this.getRawAnnouncement(options);
    const targeting = await this.announcementTargetingService.getAnnouncementTargeting(
      { where: { announcement }, relations: ['community'] },
    );
    announcement[
      'targeting'
    ] = (await this.announcementTargetingService.parseRawTargetingToConfig(
      targeting,
    )) as any;
    return announcement;
  }

  /**
   * Add raw Announcement
   */
  async addRawAnnouncement(data: {}): Promise<AnnouncementEntity> {
    const announcementCreated = this.announcementRepository.create(data);
    return this.announcementRepository.save(announcementCreated);
  }

  /**
   * Add announcement with settings, targetting, attachments and emails.
   * @param data Announcement data along with the setting & configuration.
   */
  async addAnnouncement(
    data: AddAnnouncementDto & { community: number; poster: number },
  ): Promise<AnnouncementEntity> {
    // TODO: Add in emails.
    const expSetting = get(data, 'experienceSetting', {});
    const targeting = get(data, 'targeting', {});
    const attachments = get(data, 'attachments', []);
    delete data.experienceSetting;
    delete data.targeting;
    delete data.attachments;

    const announceEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.ANNOUNCEMENT,
    );

    const announcementSaved = await this.addRawAnnouncement(data);

    // Adding targeting setting,
    await this.announcementTargetingService.addAnnouncementTargeting({
      targetingSetting: targeting,
      announcement: announcementSaved,
      community: data.community,
    });

    // Adding experience setting.
    const expSettingAdded = await this.entityExperienceSettingService.addEntityExperienceSetting(
      {
        ...expSetting,
        community: data.community,
        entityObjectId: announcementSaved.id,
        entityType: announceEntityType,
      },
    );
    await this.updateRawAnnouncement(
      { id: announcementSaved.id },
      { experienceSetting: expSettingAdded },
    );

    // Adding attachments.
    if (get(attachments, 'length')) {
      const attachmentsData = map(attachments, attachment => ({
        url: get(attachment, 'url'),
        size: get(attachment, 'size'),
        userAttachment: get(attachment, 'userAttachment'),
        attachmentType: get(attachment, 'attachmentType'),
        announcement: announcementSaved,
        community: data.community,
      }));
      await this.announcementAttachmentService.addAnnouncementAttachment(
        attachmentsData,
      );
    }

    // Adding announcement's schedule in notifications DB (for emails).
    if (
      announcementSaved.sendEmail &&
      announcementSaved.status === AnnouncementStatuses.SCHEDULED
    ) {
      NotificationHookService.addAnnoucementSchedule({
        announcementId: announcementSaved.id,
        communityId: data.community,
        scheduledAt: announcementSaved.scheduledAt,
      });
    }

    return announcementSaved;
  }

  /**
   * Announcement raw Announcement
   */
  async updateRawAnnouncement(options: {}, data: {}): Promise<{}> {
    return this.announcementRepository.update(options, data);
  }

  /**
   * Update announcement with settings, targetting, attachments and emails.
   * @param data Announcement data along with the setting & configuration.
   */
  async updateAnnouncement(
    options: { id: number; community: number },
    data: AddAnnouncementDto,
  ): Promise<{}> {
    const expSetting = get(data, 'experienceSetting', {});
    const targeting = get(data, 'targeting', {});
    const attachments = get(data, 'attachments');
    delete data.experienceSetting;
    delete data.targeting;
    delete data.attachments;

    const announceEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.ANNOUNCEMENT,
    );

    const updateAnnouncementRes = await this.updateRawAnnouncement(
      options,
      data,
    );
    const updatedAnnouncement = await this.getRawAnnouncement({
      where: { ...options },
    });

    if (updatedAnnouncement) {
      // Updating targeting setting,
      await this.announcementTargetingService.updateAnnouncementTargeting({
        targetingSetting: targeting,
        announcement: updatedAnnouncement,
        community: options.community,
      });

      // Updating experience setting.
      await this.entityExperienceSettingService.updateEntityExperienceSetting(
        {
          community: options.community,
          entityObjectId: updatedAnnouncement.id,
          entityType: announceEntityType,
        },
        expSetting,
      );

      // Updating attachments.
      if (attachments && get(attachments, 'length')) {
        await this.announcementAttachmentService.deleteAnnouncementAttachment({
          announcement: updatedAnnouncement.id,
          community: options.community,
        });
        const attachmentsData = map(attachments, attachment => ({
          ...attachment,
          announcement: updatedAnnouncement,
          community: options.community,
        }));
        await this.announcementAttachmentService.addAnnouncementAttachment(
          attachmentsData,
        );
      }
    }

    // Saving announcement's schedule in notifications DB (for emails).
    if (
      updatedAnnouncement.sendEmail &&
      updatedAnnouncement.status === AnnouncementStatuses.SCHEDULED
    ) {
      NotificationHookService.saveAnnouncementSchedule({
        announcementId: updatedAnnouncement.id,
        communityId: options.community,
        scheduledAt: updatedAnnouncement.scheduledAt,
      });
    } else {
      // Remove the email schedule if the announcement has been updated to a
      // non-email one.
      NotificationHookService.removeAnnouncementSchedule({
        announcementId: updatedAnnouncement.id,
        communityId: options.community,
      });
    }

    return updateAnnouncementRes;
  }

  /**
   * Increase view count of an announcement.
   * @param options Find options to search announcment on.
   * @param countToAdd Number of views to add.
   */
  async increaseViewCount(options: {}, countToAdd = 1): Promise<{}> {
    return this.updateRawAnnouncement(options, {
      viewCount: () => `view_count + ${countToAdd}`,
    });
  }

  async getAnnouncementsPermissions(
    userId: number,
    community: number,
    announcementIds?: number[],
  ): Promise<
    {
      announcement: number;
      manageAnnouncement: number;
      viewAnnouncement: number;
    }[]
  > {
    if (announcementIds && !announcementIds.length) return [];

    let announcePerms = [];
    const [announcements, entityTypes, communityPerms] = await Promise.all([
      this.getRawAnnouncements({
        where: {
          community,
          ...(get(announcementIds, 'length') && { id: In(announcementIds) }),
        },
        relations: ['entityType'],
      }),
      EntityMetaService.getEntityTypesMetaByAbbreviations([
        ENTITY_TYPES.CHALLENGE,
        ENTITY_TYPES.IDEA,
      ]),
      this.roleActorService.getEntityPermissions(null, null, community, {
        userId: userId,
      }),
    ]);

    if (!get(announcements, 'length')) return [];

    const entityTypesGrouped = keyBy(entityTypes, 'abbreviation');
    const challengeEntityType = entityTypesGrouped[ENTITY_TYPES.CHALLENGE];
    const oppoEntityType = entityTypesGrouped[ENTITY_TYPES.IDEA];

    if (communityPerms.manageAnnouncement === PERMISSIONS_MAP.ALLOW) {
      announcePerms = announcements.map(announcement => ({
        announcement: announcement.id,
        manageAnnouncement: PERMISSIONS_MAP.ALLOW,
        viewAnnouncement: PERMISSIONS_MAP.ALLOW,
      }));
    } else {
      const challengeIds = [];
      const opportunityIds = [];
      announcements.forEach(announcement => {
        if (get(announcement, 'entityType.id') === challengeEntityType.id) {
          challengeIds.push(announcement.entityObjectId);
        } else if (get(announcement, 'entityType.id') === oppoEntityType.id) {
          opportunityIds.push(announcement.entityObjectId);
        }
      });

      let challengePermGrouped = {};
      let oppoPermGrouped = {};

      if (opportunityIds.length) {
        // TODO: Optimize this while implementing announcements for opportunities.
        // Get parsed opportunity permissions instead on raw or get oppo's
        // challenges to find the max permission available (whichever method
        // is faster).

        // Get & group opportunity permissions.
        const oppoPerms = await this.roleActorService.getEntityPermissionsBulk(
          opportunityIds,
          oppoEntityType.id,
          community,
          userId,
        );
        oppoPermGrouped = keyBy(oppoPerms, 'entityObjectId');
      }
      if (challengeIds.length) {
        // Get & group challenge permissions.
        const challengePermissions = await this.roleActorService.getEntityPermissionsBulk(
          challengeIds,
          challengeEntityType.id,
          community,
          userId,
        );
        challengePermGrouped = keyBy(challengePermissions, 'entityObjectId');
      }

      // Get announcement targetting view permission.
      const annTargetingPerm = await this.announcementTargetingService.getViewPermOnTargeting(
        announcements,
        userId,
        community,
      );
      const annTargetingPermGrouped = keyBy(annTargetingPerm, 'announcement');

      announcePerms = announcements.map(announcement => {
        const perm = {
          manageAnnouncement: PERMISSIONS_MAP.DENY,
          viewAnnouncement: PERMISSIONS_MAP.DENY,
        };

        if (!announcement.entityType && !announcement.entityObjectId) {
          // Check community permissions.
          perm.manageAnnouncement = communityPerms.manageAnnouncement;
          perm.viewAnnouncement = max([
            perm.manageAnnouncement,
            communityPerms.viewAnnouncement,
          ]);
        } else if (
          get(announcement, 'entityType.id') === challengeEntityType.id &&
          get(challengePermGrouped, announcement.entityObjectId)
        ) {
          // Check challenge permissions.
          perm.manageAnnouncement = max([
            communityPerms.manageAnnouncement,
            get(
              challengePermGrouped,
              `${announcement.entityObjectId}.permissions.manageAnnouncement`,
              PERMISSIONS_MAP.DENY,
            ),
          ]);
          perm.viewAnnouncement = max([
            perm.manageAnnouncement,
            communityPerms.viewAnnouncement,
            get(
              challengePermGrouped,
              `${announcement.entityObjectId}.permissions.viewAnnouncement`,
              PERMISSIONS_MAP.DENY,
            ),
          ]);
        } else if (
          get(announcement, 'entityType.id') === oppoEntityType.id &&
          get(oppoPermGrouped, announcement.entityObjectId)
        ) {
          // Check opportunity permissions.
          perm.manageAnnouncement = max([
            communityPerms.manageAnnouncement,
            get(
              oppoPermGrouped,
              `${announcement.entityObjectId}.permissions.manageAnnouncement`,
              PERMISSIONS_MAP.DENY,
            ),
          ]);
          perm.viewAnnouncement = max([
            perm.manageAnnouncement,
            communityPerms.viewAnnouncement,
            get(
              oppoPermGrouped,
              `${announcement.entityObjectId}.permissions.viewAnnouncement`,
              PERMISSIONS_MAP.DENY,
            ),
          ]);
        }

        // Check View Permission on announcemnet targetting.
        if (
          perm.viewAnnouncement === PERMISSIONS_MAP.SCENARIO &&
          get(annTargetingPermGrouped, announcement.id)
        ) {
          perm.viewAnnouncement =
            annTargetingPermGrouped[announcement.id].viewAnnouncement;
        }

        return {
          announcement: announcement.id,
          ...perm,
        };
      });
    }

    return announcePerms;
  }

  /**
   * Archive Announcement
   */
  async archiveAnnouncement(options: {}): Promise<{}> {
    // Removing announcement's schedule in notifications DB (for emails).
    NotificationHookService.removeAnnouncementSchedule({
      announcementId: options['id'],
      communityId: options['community'],
    });

    return this.updateRawAnnouncement(options, { isDeleted: true });
  }

  /**
   * Get emails specific data for the given announcements.
   * @param options List of announcements (containing announcementId and communityId)
   * for which data need to be fetched.
   */
  async getAnnouncementsDataForEmails(options: {
    announcements: { announcementId: number; communityId: number }[];
  }): Promise<{}> {
    const announcements = await this.getRawAnnouncements({
      where: options.announcements.map(ann => ({
        id: ann.announcementId,
        community: ann.communityId,
        status: AnnouncementStatuses.SCHEDULED,
        isDeleted: false,
      })),
      relations: [
        'entityType',
        'attachments',
        'poster',
        'targetSetting',
        'community',
      ],
    });

    if (announcements.length) {
      // Add in targeted users.
      const annsByCommunity = groupBy(announcements, 'community.id');
      const targetUserResp = await Promise.all(
        map(annsByCommunity, (anns, communityId) =>
          this.announcementTargetingService.getAnnouncementsTargetedUsers(
            anns,
            parseInt(communityId),
          ),
        ),
      );
      const targetUsers = flatten(targetUserResp);
      const targetUsersGrouped = keyBy(targetUsers, 'announcementId');

      // Fetch community URLs.
      const communityIds = uniq(map(announcements, 'community.id'));
      const communities = await this.communityService.getCommunities({
        where: { id: In(communityIds) },
      });
      const communityById = keyBy(communities, 'id');

      const port =
        this.configService.getEnv() === ENVIRONMENTS.DEVELOP
          ? `:${this.configService.getNumber('CLIENT_PORT')}`
          : '';

      announcements.forEach(ann => {
        // Add in targeted users.
        ann['targetedUsers'] = get(
          targetUsersGrouped,
          `${ann.id}.targetedUsers`,
          [],
        );

        // Add redirect links for emails.
        const communityUrl = communityById[ann.community.id].url;
        ann['viewUpdatesLink'] = '';
        ann['viewUpdatesLinkText'] = 'View Update';
        ann['viewChallengeOppoLink'] = '';
        ann['viewChallengeOppoLinkText'] = '';
        if (!ann.entityType) {
          // TODO: Update the link to community's View All Updates link when integrated.
          ann[
            'viewUpdatesLink'
          ] = `${communityUrl}${port}/?announcementId=${ann.id}`;
        } else if (
          ann.entityType &&
          ann.entityType.abbreviation === ENTITY_TYPES.CHALLENGE &&
          ann.entityObjectId
        ) {
          ann[
            'viewUpdatesLink'
          ] = `${communityUrl}${port}/challenges/updates/${ann.entityObjectId}?announcementId=${ann.id}`;
          ann[
            'viewChallengeOppoLink'
          ] = `${communityUrl}${port}/challenges/view/${ann.entityObjectId}`;
          ann['viewChallengeOppoLinkText'] = 'View Challenge';
        }
      });

      // Update announcements' status to sent.
      this.updateRawAnnouncement(
        { id: In(announcements.map(ann => ann.id)) },
        { status: AnnouncementStatuses.SENT },
      );
    }

    return announcements;
  }
}
