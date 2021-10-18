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

import { OpportunityUserService } from './opportunityUser.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { Request } from 'express';
import { DeleteOpportunityUserDto, BulkAddOpportunityUserDto } from './dto';
@Controller('opportunity-user')
export class OpportunityUserController {
  constructor(
    private readonly opportunityUserService: OpportunityUserService,
  ) {}

  @Post()
  async addOpportunityUser(
    @Body() body: [],
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.opportunityUserService.addOpportunityUserWithSetting(
      body,
      req['userData'],
      true,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllOpportunityUsers(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      where: { ...queryParams, community: req['userData'].currentCommunity },
      relations: ['user', 'user.profileImage', 'opportunity'],
    };
    const opportunityUsers = await this.opportunityUserService.getOpportunityUsersWithUserRoles(
      options,
    );
    return ResponseFormatService.responseOk(opportunityUsers, 'All');
  }

  @Get(':id')
  async getOpportunityUser(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const opportunityUser = await this.opportunityUserService.getOpportunityUsers(
      { id: id, community: req['userData'].currentCommunity },
    );
    return ResponseFormatService.responseOk(opportunityUser, 'All');
  }

  @Patch(':id')
  async updateOpportunityUser(
    @Param('id') id: string,
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.opportunityUserService.updateOpportunityUser(
      { id: id, community: req['userData'].currentCommunity },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeOpportunityUser(
    @Param() params: DeleteOpportunityUserDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.opportunityUserService.deleteOpportunityUser(
      { id: params.id, community: req['userData'].currentCommunity },
      req['userData'],
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }

  @Post('bulk-user-settings/')
  async bulkAddOpportunityUser(
    @Body() body: BulkAddOpportunityUserDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const response = await this.opportunityUserService.bulkAddOpportunityUserWithSetting(
      body,
      req['userData'],
      true,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }
}
