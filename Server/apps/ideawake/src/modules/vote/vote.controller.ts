import {
  Controller,
  Post,
  Get,
  // Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { AddVoteDto, GetAllVotes, GetVote, GetVoteQuery } from './dto';
import { Request } from 'express';

@Controller('vote')
export class VoteController {
  constructor(public voteService: VoteService) {}

  @Post()
  async addVote(
    @Body() body: AddVoteDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const duplicatVote = await this.voteService.getVote({
      where: {
        user: req['userData'].id,
        entityObjectId: body.entityObjectId,
        entityType: body.entityType,
        community: req['userData'].currentCommunity,
      },
    });
    body.isDeleted = false;
    body.createdBy = req['userData'].id;
    body.updatedBy = req['userData'].id;
    body.user = req['userData'].id;
    if (duplicatVote.length) {
      return ResponseFormatService.responseBadRequest([], 'Duplicate Vote');
    }

    req['userData']['community'] = req['userData'].currentCommunity;
    const response = await this.voteService.addVote(body, req['userData']);
    return ResponseFormatService.responseOk(
      response,
      'Vote Added Successfully',
    );
  }

  @Get()
  async getAllVotes(
    @Query() queryParams: GetAllVotes,
  ): Promise<ResponseFormat> {
    const where = { community: queryParams.community };
    const response = await this.voteService.getAllVote(where);
    return ResponseFormatService.responseOk(response, 'All Votes');
  }

  @Get(':type/:entityObjectId')
  async getVote(
    @Query() queryParams: GetVoteQuery,
    @Param() param: GetVote,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const where = {
      community: queryParams.community,
      user: req['userData'].id,
      entityObjectId: param.entityObjectId,
      abbreviation: param.type,
    };
    const response = await this.voteService.getTypeVote(where);
    return ResponseFormatService.responseOk(response, 'Vote');
  }

  @Post('fetch-my-entities-votes')
  async getUserVotesInBulk(
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.voteService.getUserVotesInBulk({
      user: req['userData'].id,
      community: req['userData'].currentCommunity,
      entityObjectIds: body['entityObjectIds'],
      entityTypeAbbr: body['entityTypeAbbr'],
    });
    return ResponseFormatService.responseOk(response, 'My Votes');
  }

  @Delete(':id')
  async removeTag(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.voteService.deleteVote({ id: id });
    return ResponseFormatService.responseOk(deleteData, 'Vote Deleted');
  }
}
