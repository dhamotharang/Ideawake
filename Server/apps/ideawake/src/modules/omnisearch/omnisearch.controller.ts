import { Controller, Get, Query, Req } from '@nestjs/common';

import { OmnisearchService } from './omnisearch.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { SearchDto } from './dto';
import { Request } from 'express';

@Controller('search')
export class OmniSearchController {
  constructor(private readonly omnisearchService: OmnisearchService) {}

  @Get()
  async search(
    @Query() queryParams: SearchDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const results = await this.omnisearchService.search({
      query: queryParams.query,
      community: req['userData'].currentCommunity,
      userId: req['userData'].id,
    });
    return ResponseFormatService.responseOk(results, 'Search Results');
  }
}
