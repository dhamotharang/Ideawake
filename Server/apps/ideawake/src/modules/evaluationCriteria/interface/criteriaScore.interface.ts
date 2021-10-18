'use strict';

import { EvaluationCriteriaEntity } from '../evaluationCriteria.entity';

export interface CriteriaScoreInterface {
  criteria?: EvaluationCriteriaEntity;
  maxScore: number;
  minScore: number;
  avgScore: number;
  avgNormalizedScore: number;
  rawNormalizedScore: number;
  totalNormalizedScore: number;
  totalResponses: number;
  responseDistribution?: {};
  variance?: number;
}
