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
} from '@nestjs/common';
import { Request } from 'express';

import { OpportunityDraftService } from './opportunityDraft.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddOpportunityDraftDto } from './dto/AddOpportunityDraftDto';
import { GetOpportunityDraftDto } from './dto';

@Controller('opportunity/draft')
export class OpportunityDraftController {
  constructor(
    private readonly opportunityDraftService: OpportunityDraftService,
  ) {}

  @Post()
  async addOpportunityDraft(
    @Body() body: AddOpportunityDraftDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.opportunityDraftService.addOpportunityDraft({
      ...body,
      userId: req['userData'].id,
      communityId: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getMyOpportunityDrafts(
    @Req() req: Request,
    @Query() queryParams: GetOpportunityDraftDto,
  ): Promise<ResponseFormat> {
    const [
      opportunityDrafts,
      totalCount,
    ] = await this.opportunityDraftService.getOpportunityDrafts({
      where: {
        ...queryParams,
        userId: req['userData'].id,
        communityId: req['userData'].currentCommunity,
      },
      take: queryParams.take,
      skip: queryParams.skip,
      relations: ['opportunityType'],
      order: {
        updatedAt: 'DESC',
      },
    });

    const response = {
      opportunityDrafts: opportunityDrafts,
      count: totalCount,
    };
    return ResponseFormatService.responseOk(response, 'My Opportunity Drafts');
  }

  @Get('count')
  async getMyOpportunityDraftTotalCount(
    @Req() req: Request,
    @Query() queryParams: GetOpportunityDraftDto,
  ): Promise<ResponseFormat> {
    const opportunityDraftsCount = await this.opportunityDraftService.getOpportunityDraftsCount(
      {
        where: {
          ...queryParams,
          userId: req['userData'].id,
          communityId: req['userData'].currentCommunity,
        },
      },
    );

    const response = {
      count: opportunityDraftsCount,
    };
    return ResponseFormatService.responseOk(
      response,
      'My Opportunity Drafts Total Count',
    );
  }

  @Get(':id')
  async getOpportunityDraft(@Param('id') id: string): Promise<ResponseFormat> {
    const opportunityDraft = await this.opportunityDraftService.getOpportunityDraft(
      { where: { id: parseInt(id) } },
    );
    return ResponseFormatService.responseOk(
      opportunityDraft,
      'Opportunity Draft Details.',
    );
  }

  @Patch(':id')
  async updateOpportunityDraft(
    @Param('id') id: string,
    @Body() body: AddOpportunityDraftDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    await this.opportunityDraftService.updateOpportunityDraft(
      {
        id: parseInt(id),
        userId: req['userData'].id,
        communityId: req['userData'].currentCommunity,
      },
      {
        ...body,
        userId: req['userData'].id,
        communityId: req['userData'].currentCommunity,
      },
    );
    const opportunityDraft = await this.opportunityDraftService.getOpportunityDraft(
      { where: { id: parseInt(id) } },
    );
    return ResponseFormatService.responseOk(opportunityDraft, 'Draft Updated');
  }

  @Delete(':id')
  async removeOpportunityDraft(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.opportunityDraftService.deleteOpportunityDraft(
      {
        id: parseInt(id),
        userId: req['userData'].id,
        communityId: req['userData'].currentCommunity,
      },
    );
    return ResponseFormatService.responseOk(deleteData, 'Draft Deleted');
  }
}
