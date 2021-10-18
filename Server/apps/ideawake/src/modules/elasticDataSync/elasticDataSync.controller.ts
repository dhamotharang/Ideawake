import { Controller, Get } from '@nestjs/common';

import { ElasticDataSyncService } from './elasticDataSync.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('elastic-data-sync')
export class ElasticDataSyncController {
  constructor(
    private readonly elasticDataSyncService: ElasticDataSyncService,
  ) {}

  @Get('users')
  async syncUsers(): Promise<ResponseFormat> {
    this.elasticDataSyncService.addUserData();
    return ResponseFormatService.responseOk(
      [],
      'Adding Service StartedSearch Results',
    );
  }

  @Get('challenges')
  async syncChallenges(): Promise<ResponseFormat> {
    this.elasticDataSyncService.addChallengeData();
    return ResponseFormatService.responseOk(
      [],
      'Adding Service StartedSearch Results',
    );
  }

  @Get('opportunities')
  async syncOpportunities(): Promise<ResponseFormat> {
    this.elasticDataSyncService.addOpportunityData();
    return ResponseFormatService.responseOk(
      [],
      'Adding Service StartedSearch Results',
    );
  }
}
