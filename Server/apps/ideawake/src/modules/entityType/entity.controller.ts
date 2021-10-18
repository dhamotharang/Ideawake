import { Controller, Get, Param, Query } from '@nestjs/common';
import { EntityTypeService } from './entity.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { GetEntityTypesDto } from './dto';

@Controller('entity')
export class EntityTypeController {
  constructor(public entityService: EntityTypeService) {}

  @Get()
  async getAllEntityTypes(
    @Query() queryParams: GetEntityTypesDto,
  ): Promise<ResponseFormat> {
    const options = {
      where: queryParams,
    };
    const response = await this.entityService.getEntityTypes(options);
    return ResponseFormatService.responseOk(response, 'All');
  }

  @Get(':id')
  async getEntityType(@Param('id') id: string): Promise<ResponseFormat> {
    const response = await this.entityService.getEntityTypes({
      id: id,
    });
    return ResponseFormatService.responseOk(response, 'All');
  }
}
