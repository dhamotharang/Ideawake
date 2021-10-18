import {
  Body,
  Controller,
  Post,
  Req,
  Delete,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddOpportunityLinkDto } from './dto/AddOpportunityLinkDto';
import { OpportunityLinkService } from './opportunityLink.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { concat } from 'lodash';
import { Request } from 'express';
import { OpportunityLinkRelationEnum } from '../../enum';

@Controller('opportunity/link')
export class OpportunityLinkController {
  constructor(
    private readonly opportunityLinkService: OpportunityLinkService,
  ) {}

  @Post()
  async linkOpportunity(
    @Body() body: AddOpportunityLinkDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const linkedOpportunities = body.linkedOpportunityIds.map(linkedOppoId => ({
      relation: body.relation,
      opportunityId: body.opportunityId,
      linkedOpportunityId: linkedOppoId,
      communityId: req['userData'].currentCommunity,
    }));
    const response = await this.opportunityLinkService.addOpportunityLink(
      linkedOpportunities,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Delete(':id')
  async unlinkOpportunity(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.opportunityLinkService.deleteOpportunityLink({
      id: parseInt(id),
      communityId: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, 'Link Deleted');
  }

  @Patch(':id')
  async updateOpportunityLink(
    @Param('id') id: string,
    @Body() body: { relation: OpportunityLinkRelationEnum },
  ): Promise<ResponseFormat> {
    const updateData = await this.opportunityLinkService.updateOpportunityLink(
      { id: id },
      { relation: body.relation },
    );

    return ResponseFormatService.responseOk(updateData, 'Updated Successfully');
  }

  @Get('linkedlist/:id')
  async getLinkedOpportunities(
    @Param('id') opportunityId: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const opportunitiesLinked = await this.opportunityLinkService.getOpportunityLinks(
      {
        where: {
          opportunityId: parseInt(opportunityId),
          communityId: req['userData'].currentCommunity,
        },
        relations: [
          'opportunity',
          'opportunity.opportunityType',
          'opportunity.stage',
          'opportunity.stage.status',
          'linkedOpportunity',
          'linkedOpportunity.opportunityType',
          'linkedOpportunity.stage',
          'linkedOpportunity.stage.status',
        ],
      },
    );

    const opportunitesReverseLinked = await this.opportunityLinkService.getOpportunityLinks(
      {
        where: {
          linkedOpportunityId: parseInt(opportunityId),
          communityId: req['userData'].currentCommunity,
        },
        relations: [
          'opportunity',
          'opportunity.opportunityType',
          'opportunity.stage',
          'opportunity.stage.status',
          'linkedOpportunity',
          'linkedOpportunity.opportunityType',
          'linkedOpportunity.stage',
          'linkedOpportunity.stage.status',
        ],
      },
    );

    const opportunitesReverseLinkedMapped = this.opportunityLinkService.reverseLinkMapping(
      opportunitesReverseLinked,
    );

    const allOpportunities = concat(
      opportunitiesLinked,
      opportunitesReverseLinkedMapped,
    );

    return ResponseFormatService.responseOk(
      {
        linkedOpportunities: allOpportunities,
      },
      'All',
    );
  }
}
