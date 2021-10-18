'use strict';

export interface EvaluationResponseDataInterface {
  // Will be a string key in case of 'question' type and number value in case
  // of 'number' type criteria.
  selected: string | number;
}
