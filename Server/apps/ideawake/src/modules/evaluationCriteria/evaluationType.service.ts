import { Injectable } from '@nestjs/common';

import { EvaluationTypeRepository } from './evaluationType.repository';
import { EvaluationTypeEntity } from './evaluationType.entity';

@Injectable()
export class EvaluationTypeService {
  constructor(
    public readonly evaluationTypeRepository: EvaluationTypeRepository,
  ) {}

  async getEvaluationType(options: {}): Promise<EvaluationTypeEntity[]> {
    return this.evaluationTypeRepository.find(options);
  }
}
