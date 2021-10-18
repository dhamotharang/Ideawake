import { Controller, Get, Query } from '@nestjs/common';

import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { EvaluationTypeService } from './evaluationType.service';

@Controller('evaluation-type')
export class EvaluationTypeController {
  constructor(private evaluationTypeService: EvaluationTypeService) {}

  @Get()
  async getAllEvaluationTypes(@Query() queryParams): Promise<ResponseFormat> {
    const evaluationTypes = await this.evaluationTypeService.getEvaluationType(
      queryParams,
    );
    return ResponseFormatService.responseOk(
      evaluationTypes,
      'Evaluation Types',
    );
  }
}
