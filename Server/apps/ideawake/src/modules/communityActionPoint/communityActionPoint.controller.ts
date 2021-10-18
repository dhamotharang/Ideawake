import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { CommunityActionPointService } from './communityActionPoint.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  GetCommunityActionPointDto,
  EditCommunityActionPointDto,
} from './dto/index';
@Controller('community-action-point')
export class CommunityActionPointController {
  constructor(
    private readonly communityActionPointService: CommunityActionPointService,
  ) {}

  @Post()
  async addCommunityActionPoint(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.communityActionPointService.addCommunityActionPoint(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllCommunityActionPoints(
    @Query() queryParmas: GetCommunityActionPointDto,
  ): Promise<ResponseFormat> {
    const options = {
      where: {
        community: queryParmas.community,
      },
      relations: ['actionType', 'community', 'entityType'],
    };
    const communityActionPoints = await this.communityActionPointService.getCommunityActionPoints(
      options,
    );
    return ResponseFormatService.responseOk(communityActionPoints, '');
  }

  @Get(':id')
  async getCommunityActionPoint(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const communityActionPoint = await this.communityActionPointService.getCommunityActionPoints(
      { id: id },
    );
    return ResponseFormatService.responseOk(communityActionPoint, 'All');
  }

  @Patch()
  async updateCommunityActionPoint(
    @Body() body: EditCommunityActionPointDto,
  ): Promise<ResponseFormat> {
    // if (body.length) {
    const updatePromiseArr = [];
    for (const iterator in body.data) {
      updatePromiseArr.push(
        this.communityActionPointService.updateCommunityActionPoint(
          { id: body.data[iterator]['id'] },
          { experiencePoint: body.data[iterator]['experiencePoint'] },
        ),
      );
    }
    const updateResult = await Promise.all(updatePromiseArr);
    // }

    return ResponseFormatService.responseOk(updateResult, '');
  }

  @Delete(':id')
  async removeCommunityActionPoint(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.communityActionPointService.deleteCommunityActionPoint(
      {
        id: id,
      },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
