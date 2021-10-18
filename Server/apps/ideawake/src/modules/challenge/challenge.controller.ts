import { Request } from 'express';
import * as _ from 'lodash';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { GetImageUploadUrl } from '../../common/dto/GetImageUploadUrl';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ChallengeAttachmentService } from '../challengeAttachment/challengeAttachment.service';
import { ChallengeService } from './challenge.service';
import {
  AddChallengeDto,
  GetChallengeDto,
  ChallengeStatusUpdate,
  SearchChallengeDto,
} from './dto';
import { EditChallengeDto } from './dto/EditChallengeDto';
import { IncreaseViewCountChallengeDto } from './dto/IncreaseViewCountChallengeDto';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import { PERMISSIONS_KEYS } from '../../common/constants/constants';
import { PermissionsCondition } from '../../enum/permissions-condition.enum';
import { RequestPermissionsKey } from '../../enum/request-permissions-key.enum';
import { GetPostOpportunityPermissionsDto } from './dto/GetPostOpportunityPermissionsDto';
import { OpportunityService } from '../opportunity/opportunity.service';

@Controller('challenge')
@UseGuards(PermissionsGuard)
export class ChallengeController {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly challengeAttachmentService: ChallengeAttachmentService,
    private readonly awsS3Service: AwsS3Service,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
    public readonly opportunityService: OpportunityService,
  ) {}

  @Post()
  async addChallenge(
    @Body() body: AddChallengeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (body.sponsors && body.sponsors.length === 0) {
      return ResponseFormatService.responseBadRequest(
        [],
        'There must be atleast 1 sponsor.',
      );
    }

    const response = await this.challengeService.addChallenge({
      ...body,
      community: req['userData'].currentCommunity,
      isDeleted: _.get(body, 'isDeleted', false),
    });

    if (body.attachments && body.attachments.length) {
      const newAttachmentsData = [];
      _.map(
        body.attachments,
        (val: {
          url: string;
          attachmentType: string;
          isSelected: number;
          size: number;
          userAttachment: string;
        }) => {
          newAttachmentsData.push({
            url: val.url,
            attachmentType: val.attachmentType,
            isSelected: val.isSelected,
            challenge: response.id,
            isDeleted: false,
            size: val.size,
            userAttachment: val.userAttachment,
          });
        },
      );
      await this.challengeAttachmentService.addChallengeAttachment(
        newAttachmentsData,
      );
    }

    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllChallenges(
    @Query() queryParams: GetChallengeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const challengesRes = await this.challengeService.getCommunityChallenges({
      filters: {
        draft: false,
        status: queryParams.status,
        ...(queryParams.isDeleted && { isDeleted: queryParams.isDeleted }),
      },
      communityId: req['userData'].currentCommunity,
      userId: req['userData'].id,
      ...(queryParams.take && { take: queryParams.take }),
      ...(queryParams.skip && { skip: queryParams.skip }),
    });

    // TODO: Update the following returned response to return total counts along
    // with challenges after updating the frontend.

    return ResponseFormatService.responseOk(
      challengesRes.challenges,
      'All Challenges',
    );
  }

  @Get('permissions')
  async getPermissions(
    @Query('id') id,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const permissions = await this.challengeService.getPermissions(
      id,
      req['userData'].id,
    );
    return ResponseFormatService.responseOk(permissions, 'All');
  }

  @Post('get-post-opp-permissions')
  async getPostOpportunityPermissions(
    @Body() body: GetPostOpportunityPermissionsDto,
  ): Promise<ResponseFormat> {
    const permissions = await this.challengeService.getPostOpportunityPermissions(
      body.challenges,
    );
    return ResponseFormatService.responseOk(
      permissions,
      'Challenges post opportunity permissions.',
    );
  }

  @Get('get-upload-url')
  async getUploadUrl(
    @Query()
    queryParams: GetImageUploadUrl,
  ): Promise<ResponseFormat> {
    const signedUrlConfig = await this.awsS3Service.getSignedUrl2(
      queryParams.fileName,
      queryParams.contentType,
      'attachments/challenge/',
    );
    return ResponseFormatService.responseOk(signedUrlConfig, 'All');
  }

  @Get('search-challenge')
  async filterChallenge(
    @Query() queryParams: SearchChallengeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    let challenges = { challenges: [], total: 0 };
    if (queryParams.searchText) {
      challenges = await this.challengeService.filterChallenges({
        searchText: queryParams.searchText,
        isDeleted: queryParams.isDeleted || false,
        draft: false,
        userId: req['userData'].id,
        community: req['userData'].currentCommunity,
      });
    }

    return ResponseFormatService.responseOk(challenges, 'Search Challenges');
  }

  @Post('opportunity-count')
  async challengeOpportunityCount(
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const option = {
      where: {
        isDeleted: body['isDeleted'] || false,
        challenge: body['challenge'],
        communityId: req['userData'].currentCommunity,
      },
    };
    const count = await this.opportunityService.getOpportunityCount(option);
    return ResponseFormatService.responseOk(
      count,
      'Challenge Opportunity Count',
    );
  }

  @Get(':id')
  async getChallenge(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const challenge = await this.challengeService.searchChallenges({
      where: {
        id: id,
        community: req['userData'].currentCommunity,
        isDeleted: false,
        draft: false,
      },
      opportunityData: true,
      userId: req['userData'].id,
    });
    return ResponseFormatService.responseOk(challenge, 'All');
  }

  @Patch('update-challenge-status/:id')
  @Permissions(
    RoleLevelEnum.challenge,
    RequestPermissionsKey.PARAMS,
    'id',
    [
      PERMISSIONS_KEYS.editChallengeTargetting,
      PERMISSIONS_KEYS.editChallengeDetails,
      PERMISSIONS_KEYS.editChallengeSettings,
      PERMISSIONS_KEYS.editChallengePhaseWorkflow,
    ],
    PermissionsCondition.OR,
  )
  async updateChallengeStatus(
    @Param('id') id: string,
    @Body() body: ChallengeStatusUpdate,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.challengeService.updateChallengeStatus(
      { id: id, community: req['userData'].currentCommunity },
      body,
    );
    return ResponseFormatService.responseOk(updateData, 'Updated Successfully');
  }

  @Patch(':id')
  @Permissions(
    RoleLevelEnum.challenge,
    RequestPermissionsKey.PARAMS,
    'id',
    [
      PERMISSIONS_KEYS.editChallengeTargetting,
      PERMISSIONS_KEYS.editChallengeDetails,
      PERMISSIONS_KEYS.editChallengeSettings,
      PERMISSIONS_KEYS.editChallengePhaseWorkflow,
    ],
    PermissionsCondition.OR,
  )
  async updateChallenge(
    @Param('id') id: string,
    @Body() body: EditChallengeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (body.sponsors && body.sponsors.length === 0) {
      return ResponseFormatService.responseBadRequest(
        [],
        'There must be atleast 1 sponsor.',
      );
    }

    if (body.attachments && body.attachments.length > 0) {
      await this.challengeAttachmentService.deleteChallengeAttachment({
        challenge: id,
      });
      const newAttachmentsData = [];
      _.map(
        body.attachments,
        (
          val: {
            url: string;
            attachmentType: string;
            isSelected: number;
            size: number;
            userAttachment: string;
          },
          _key,
        ) => {
          newAttachmentsData.push({
            url: val.url,
            attachmentType: val.attachmentType,
            isSelected: val.isSelected,
            challenge: id,
            isDeleted: false,
            size: val.size,
            userAttachment: val.userAttachment,
          });
        },
      );
      await this.challengeAttachmentService.addChallengeAttachment(
        newAttachmentsData,
      );
    } else {
      await this.challengeAttachmentService.deleteChallengeAttachment({
        challenge: id,
      });
    }
    delete body.attachments;
    const updateData = await this.challengeService.updateChallenge(
      { id: id, community: req['userData'].currentCommunity },
      body,
      req.headers.origin as string,
    );
    return ResponseFormatService.responseOk(updateData, 'Updated Successfully');
  }

  @Patch('increase-view-count/:id')
  async increaseViewCount(
    @Param('id') id: string,
    @Body() body: IncreaseViewCountChallengeDto,
  ): Promise<ResponseFormat> {
    const updateData = await this.challengeService.increaseViewCount(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(
      updateData,
      'View Count Increased Successfully',
    );
  }

  @Delete(':id')
  async archiveChallenge(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.challengeService.archiveChallenge({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, 'Deleted Successfully');
  }
}
