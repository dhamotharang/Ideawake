'use strict';

import { CriteriaScoreInterface } from './criteriaScore.interface';

export interface EntityScoreInterface {
  criteriaScores: Array<CriteriaScoreInterface>;
  entityScore: {
    rawNormalizedScore: number;
    finalScore: number;
    totalNormalizedScore: number;
  };
}
