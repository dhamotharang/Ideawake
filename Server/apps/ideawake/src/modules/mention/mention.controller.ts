import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { MentionService } from './mention.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { GetMentionableDataDto } from './dto';
import { CommunityService } from '../community/community.service';
import { ChallengeService } from '../challenge/challenge.service';
import { OpportunityService } from '../opportunity/opportunity.service';

@Controller('mention')
export class MentionController {
  constructor(
    private readonly mentionService: MentionService,
    public readonly communityService: CommunityService,
    public readonly challengeService: ChallengeService,
    public readonly opportunityService: OpportunityService,
  ) {}

  @Post()
  async addMention(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.mentionService.addMention(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllMentions(): Promise<ResponseFormat> {
    const options = {};
    const mentions = await this.mentionService.getMentions(options);
    return ResponseFormatService.responseOk(mentions, 'All');
  }

  @Get('mentionable-data')
  async getMentionableData(
    @Query() queryParams: GetMentionableDataDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const userId = req['userData'].id;
    let permissions;
    let opportunity;
    let challenge;
    if (queryParams.opportunity) {
      [permissions, opportunity] = await Promise.all([
        this.opportunityService.getOpportunityPermissions(
          queryParams.opportunity,
          userId,
        ),
        this.opportunityService.getOneOpportunity({
          where: { id: queryParams.opportunity },
        }),
      ]);
    } else if (queryParams.challenge) {
      permissions = await this.challengeService.getPermissions(
        queryParams.challenge,
        userId,
      );
    } else {
      permissions = await this.communityService.getPermissions(
        queryParams.community,
        userId,
      );
    }

    const challengeId =
      queryParams.challenge ||
      (opportunity ? opportunity.challengeId : undefined);

    if (challengeId) {
      challenge = await this.challengeService.getOneChallenge({
        where: { id: challengeId },
        relations: ['challengeParticipant'],
      });
    }

    const mentionableData = await this.mentionService.getMentionableData({
      community: queryParams.community,
      opportunityId: queryParams.opportunity,
      opportunity,
      challengeId: queryParams.challenge,
      challenge: challenge,
      permissions,
      userId,
    });
    return ResponseFormatService.responseOk(
      mentionableData,
      'Mentionable users and groups.',
    );
  }

  @Get(':id')
  async getMention(@Param('id') id: string): Promise<ResponseFormat> {
    const mention = await this.mentionService.getMentions({ id: id });
    return ResponseFormatService.responseOk(mention, 'All');
  }

  @Patch(':id')
  async updateMention(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.mentionService.updateMention(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async archiveMention(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.mentionService.archiveMention({ id: id });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
