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
  UseGuards,
} from '@nestjs/common';

import { PrizeService } from './prize.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddPrizeDto } from './dto/AddPrizeDto';
import { GetImageUploadUrl } from '../../common/dto/GetImageUploadUrl';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { GetChallengePrizesDto } from './dto/GetChallengePrizesDto';
import { Request } from 'express';
import { AddPrizeAwardeeDto } from './dto/AddPrizeAwardeeDto';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import { PERMISSIONS_KEYS } from '../../common/constants/constants';
import { PermissionsService } from '../../shared/services/permissions.service';
import { PermissionsCondition } from '../../enum/permissions-condition.enum';
import { RequestPermissionsKey } from '../../enum/request-permissions-key.enum';

@Controller('prize')
@UseGuards(PermissionsGuard)
export class PrizeController {
  constructor(
    private readonly prizeService: PrizeService,
    private readonly awsS3Service: AwsS3Service,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @Permissions(
    RoleLevelEnum.challenge,
    RequestPermissionsKey.BODY,
    'challenge',
    [PERMISSIONS_KEYS.managePrize],
    PermissionsCondition.AND,
  )
  async addPrize(@Body() body: AddPrizeDto): Promise<ResponseFormat> {
    const response = await this.prizeService.addPrize(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Post('award')
  async awardPrize(
    @Body() body: AddPrizeAwardeeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const prize = await this.prizeService.getOnePrize({ id: body.prizeId });

    await this.permissionsService.verifyPermissions(
      RoleLevelEnum.challenge,
      prize.challengeId,
      req['userData'].id,
      [PERMISSIONS_KEYS.awardPrize],
      PermissionsCondition.AND,
    );

    const response = await this.prizeService.addPrizeAwardee(
      body,
      req['userData'],
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getPrizes(
    @Query()
    queryParams: GetChallengePrizesDto,
  ): Promise<ResponseFormat> {
    const prizes = await this.prizeService.getPrizes({
      where: queryParams,
      relations: [
        'awardees',
        'awardees.entityType',
        'awardees.user',
        'awardees.user.profileImage',
      ],
    });
    return ResponseFormatService.responseOk(prizes, 'All');
  }

  @Get('category')
  async getAllCategories(): Promise<ResponseFormat> {
    const options = {};
    const categories = await this.prizeService.getAllCategories(options);
    return ResponseFormatService.responseOk(categories, 'All');
  }

  @Get('get-upload-url')
  async getUploadUrl(
    @Query()
    queryParams: GetImageUploadUrl,
  ): Promise<ResponseFormat> {
    const signedUrlConfig = await this.awsS3Service.getSignedUrl2(
      queryParams.fileName,
      queryParams.contentType,
      'attachments/prize/',
    );
    return ResponseFormatService.responseOk(signedUrlConfig, 'All');
  }

  @Get('candidates/:id')
  async getPrizeCandidates(@Param('id') id: number): Promise<ResponseFormat> {
    const candidates = await this.prizeService.getPrizeCandidates(id);
    return ResponseFormatService.responseOk(candidates, 'All');
  }

  @Get(':id')
  async getPrize(@Param('id') id: string): Promise<ResponseFormat> {
    const prize = await this.prizeService.getOnePrize({
      where: { id },
      relations: [
        'awardees',
        'awardees.entityType',
        'awardees.user',
        'awardees.user.profileImage',
      ],
    });
    return ResponseFormatService.responseOk(prize, 'All');
  }

  @Patch(':id')
  @Permissions(
    RoleLevelEnum.challenge,
    RequestPermissionsKey.BODY,
    'challenge',
    [PERMISSIONS_KEYS.managePrize],
    PermissionsCondition.AND,
  )
  async updatePrize(
    @Param('id') id: string,
    @Body() body: AddPrizeDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const prize = await this.prizeService.getOnePrize({ id });

    // Checking the permission again to check the challenge in which the prize
    // is currently in. This is required in the case where the prize's challenge
    // is being updatedd.
    await this.permissionsService.verifyPermissions(
      RoleLevelEnum.challenge,
      prize.challengeId,
      req['userData'].id,
      [PERMISSIONS_KEYS.managePrize],
      PermissionsCondition.AND,
    );

    const updateData = await this.prizeService.updatePrize({ id: id }, body);
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removePrize(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const prize = await this.prizeService.getOnePrize({ id });

    await this.permissionsService.verifyPermissions(
      RoleLevelEnum.challenge,
      prize.challengeId,
      req['userData'].id,
      [PERMISSIONS_KEYS.managePrize],
      PermissionsCondition.AND,
    );

    const deleteData = await this.prizeService.softDeletePrize({ id: id });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
