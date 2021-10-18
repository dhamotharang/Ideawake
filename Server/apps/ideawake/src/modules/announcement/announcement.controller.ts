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
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';

import { AnnouncementService } from './announcement.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  AddAnnouncementDto,
  GetAnnouncementsDto,
  GetAnnouncementsFeedDto,
} from './dto';
import { In, LessThanOrEqual, Not } from 'typeorm';
import * as moment from 'moment';
import {
  AnnouncementStatuses,
  PermissionsCondition,
  RoleLevelEnum,
} from '../../enum';
import { AnnouncementTargetingService } from './announcementTargeting.service';
import { compact, get, head, keyBy } from 'lodash';
import {
  ENTITY_TYPES,
  PERMISSIONS_KEYS,
  PERMISSIONS_MAP,
} from '../../common/constants/constants';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { PermissionsService } from '../../shared/services/permissions.service';
import { GetPotentialTargetsCountDto } from './dto/GetPotentialTargetsCountDto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly announcementTargetingService: AnnouncementTargetingService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post('get-potential-targets-count')
  @HttpCode(200)
  async getPotentialTargetsCount(
    @Req() req: Request,
    @Body() body: GetPotentialTargetsCountDto,
  ): Promise<ResponseFormat> {
    // Verifying announcement management permissions.
    await this.verifyAnnouncementPermission(req, body);

    // Get potentially targeted users count.
    const potentialTargets = await this.announcementTargetingService.getPotentialTargetsCount(
      { ...body, communityId: req['userData'].currentCommunity },
    );

    return ResponseFormatService.responseOk(
      { totalTargetsCount: potentialTargets },
      `Announcement's potentially targeted users count.`,
    );
  }

  @Post()
  async addAnnouncement(
    @Body() body: AddAnnouncementDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Verifying announcement management permissions.
    await this.verifyAnnouncementPermission(req, body);

    // Adding announcement if valid permission exists.
    const response = await this.announcementService.addAnnouncement({
      ...body,
      poster: req['userData'].id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get('feed')
  async getAnnouncementsFeed(
    @Req() req: Request,
    @Query() queryParams: GetAnnouncementsFeedDto,
  ): Promise<ResponseFormat> {
    const currentTime = moment().format();

    // Update the community's feed only announcements' statuses to sent.
    await this.announcementService.updateRawAnnouncement(
      {
        isDeleted: false,
        sendFeed: true,
        sendEmail: false,
        status: AnnouncementStatuses.SCHEDULED,
        scheduledAt: LessThanOrEqual(currentTime),
        community: req['userData'].currentCommunity,
      },
      { status: AnnouncementStatuses.SENT },
    );

    // Fetch announcements.
    let announcements = await this.announcementService.getRawAnnouncements({
      where: {
        isDeleted: false,
        sendFeed: true,
        status: Not(AnnouncementStatuses.DRAFT),
        scheduledAt: LessThanOrEqual(currentTime),
        community: req['userData'].currentCommunity,
        ...(queryParams.entityObjectId && {
          entityObjectId: queryParams.entityObjectId,
        }),
        ...(queryParams.entityType && { entityType: queryParams.entityType }),
      },
      order: { scheduledAt: 'DESC' },
      relations: ['entityType', 'attachments', 'poster', 'targetSetting'],
    });

    // Getting announcements visible to user.
    const perms = await this.announcementService.getAnnouncementsPermissions(
      req['userData'].id,
      req['userData'].currentCommunity,
      announcements.map(ann => ann.id),
    );
    const permsGrouped = keyBy(perms, 'announcement');
    announcements = announcements.filter(
      ann =>
        get(
          permsGrouped,
          `${ann.id}.viewAnnouncement`,
          PERMISSIONS_MAP.DENY,
        ) === PERMISSIONS_MAP.ALLOW,
    );
    const totalCount = announcements.length;

    if (queryParams.take) {
      announcements = announcements.slice(
        queryParams.skip || 0,
        (queryParams.skip || 0) + queryParams.take,
      );
    }

    const bulkTargeting = await this.announcementTargetingService.parseRawTargetingToConfigBulk(
      compact(announcements.map(ann => ann.targetSetting)),
      req['userData'].currentCommunity,
    );
    const bulkTargetingGrouped = keyBy(bulkTargeting, 'targetingId');

    announcements.forEach(ann => {
      ann['targeting'] = get(
        bulkTargetingGrouped,
        `${get(ann, 'targetSetting.id')}.parsedConfig`,
        {},
      );
    });

    // Increment view count for the fetched announcements.
    if (announcements.length) {
      this.announcementService.increaseViewCount({
        id: In(announcements.map(ann => ann.id)),
      });
      // Updating the new view counts in the fetched data.
      announcements.forEach(ann => {
        ann.viewCount = (BigInt(ann.viewCount) + BigInt(1)).toString();
      });
    }

    return ResponseFormatService.responseOk(
      { announcements, totalCount },
      'All Announcements',
    );
  }

  @Get()
  async getManageableAnnouncements(
    @Req() req: Request,
    @Query() queryParams: GetAnnouncementsDto,
  ): Promise<ResponseFormat> {
    // Verifying announcement management permissions.
    await this.verifyAnnouncementPermission(req, queryParams);

    // Fetching announcements if valid permission exists.

    // Update the community's  feed only announcements' statuses to sent.
    const currentTime = moment().format();
    await this.announcementService.updateRawAnnouncement(
      {
        isDeleted: false,
        sendFeed: true,
        sendEmail: false,
        status: AnnouncementStatuses.SCHEDULED,
        scheduledAt: LessThanOrEqual(currentTime),
        community: req['userData'].currentCommunity,
      },
      { status: AnnouncementStatuses.SENT },
    );

    // Getting announcements.
    const [
      announcements,
      totalCount,
    ] = await this.announcementService.getRawAnnouncementsWithCount({
      where: {
        community: req['userData'].currentCommunity,
        ...(queryParams.entityObjectId && {
          entityObjectId: queryParams.entityObjectId,
        }),
        ...(queryParams.entityType && { entityType: queryParams.entityType }),
        ...(queryParams.status && { status: queryParams.status }),
        ...(queryParams.status === AnnouncementStatuses.DRAFT && {
          poster: req['userData'].id,
        }),
        ...(queryParams.hasOwnProperty('isDeleted') && {
          isDeleted: queryParams.isDeleted,
        }),
      },
      ...(queryParams.take && { take: queryParams.take }),
      ...(queryParams.skip && { skip: queryParams.skip }),
      order: { scheduledAt: 'DESC' },
      relations: ['entityType', 'attachments', 'poster', 'targetSetting'],
    });

    const bulkTargeting = await this.announcementTargetingService.parseRawTargetingToConfigBulk(
      compact(announcements.map(ann => ann.targetSetting)),
      req['userData'].currentCommunity,
    );
    const bulkTargetingGrouped = keyBy(bulkTargeting, 'targetingId');

    announcements.forEach(ann => {
      ann['targeting'] = get(
        bulkTargetingGrouped,
        `${get(ann, 'targetSetting.id')}.parsedConfig`,
        {},
      );
    });

    return ResponseFormatService.responseOk(
      { announcements, totalCount },
      'All Announcements',
    );
  }

  @Get(':id')
  async getAnnouncement(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    let announcement = {};

    // Check user's visibility permission for the required annoucement.
    const perms = await this.announcementService.getAnnouncementsPermissions(
      req['userData'].id,
      req['userData'].currentCommunity,
      [parseInt(id)],
    );
    if (get(head(perms), 'viewAnnouncement')) {
      // Fetch and return announcement if it's visbile.
      announcement = await this.announcementService.getAnnouncement({
        where: {
          id: id,
          community: req['userData'].currentCommunity,
        },
        relations: ['entityType', 'attachments', 'experienceSetting'],
      });

      // Increment the view count for the announcement (uncomment if needed).
      // this.announcementService.increaseViewCount({
      //   id: id,
      //   community: req['userData'].currentCommunity,
      // });
    }

    return ResponseFormatService.responseOk(
      announcement,
      'Announcement Details',
    );
  }

  @Patch(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() body: AddAnnouncementDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Verifying announcement management permissions based on existing announcement.
    const annoucement = await this.announcementService.getRawAnnouncement({
      where: { id: id, community: req['userData'].currentCommunity },
    });
    await this.verifyAnnouncementPermission(req, annoucement);

    // Verifying the permission based on incoming data.
    await this.verifyAnnouncementPermission(req, body);

    // Updating announcement if valid permission exists.
    const announcementData = await this.announcementService.updateAnnouncement(
      { id: parseInt(id), community: req['userData'].currentCommunity },
      body,
    );
    return ResponseFormatService.responseOk(
      announcementData,
      'Successfully updated!',
    );
  }

  @Delete(':id')
  async removeAnnouncement(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    // Verifying announcement management permissions.
    const annoucement = await this.announcementService.getRawAnnouncement({
      where: { id: id, community: req['userData'].currentCommunity },
    });
    await this.verifyAnnouncementPermission(req, annoucement);

    // Archiving announcement if valid permission exists.
    const deleteData = await this.announcementService.archiveAnnouncement({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(
      deleteData,
      'Successfully archieved!',
    );
  }

  /**
   * Helper method to verify annoucnement permission (mainly management
   * permissions).
   * @param req Incoming request.
   * @param data Annoucement data.
   * @param permKeys Permission keys to verify (default: ['manageAnnouncement']).
   * @param permCondition AND/OR condition between permission keys (default: AND).
   */
  private async verifyAnnouncementPermission(
    req: Request,
    data: {},
    permKeys = [PERMISSIONS_KEYS.manageAnnouncement],
    permCondition = PermissionsCondition.AND,
  ): Promise<void> {
    if (!data) {
      throw new ForbiddenException('Forbidden resource');
    }

    let roleLevel = RoleLevelEnum.community;
    let entityObjectId = req['userData'].currentCommunity;
    if (data['entityType'] && data['entityObjectId']) {
      const entityTypes = await EntityMetaService.getEntityTypesMetaByAbbreviations(
        [ENTITY_TYPES.CHALLENGE, ENTITY_TYPES.IDEA],
      );
      const enTypesByAbbr = keyBy(entityTypes, 'abbreviation');
      if (data['entityType'] === enTypesByAbbr[ENTITY_TYPES.CHALLENGE].id) {
        roleLevel = RoleLevelEnum.challenge;
        entityObjectId = data['entityObjectId'];
      } else if (data['entityType'] === enTypesByAbbr[ENTITY_TYPES.IDEA].id) {
        roleLevel = RoleLevelEnum.opportunity;
        entityObjectId = data['entityObjectId'];
      }
    }
    await this.permissionsService.verifyPermissions(
      roleLevel,
      entityObjectId,
      req['userData'].id,
      permKeys,
      permCondition,
    );
  }

  /**
   * Get emails specific data for the given announcements. This is intended to
   * be used by notification (and possibly other) microservices.
   *
   * @param options List of announcements (containing announcementId and communityId)
   * for which data need to be fetched.
   */
  @MessagePattern('getAnnouncementsEmailData')
  async getAnnouncementsEmailData(options: {
    announcements: { announcementId: number; communityId: number }[];
  }): Promise<{}> {
    return this.announcementService.getAnnouncementsDataForEmails(options);
  }
}
