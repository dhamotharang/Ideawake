'use strict';

export interface QuestionCriteriaConfigInterface {
  data: Array<{
    key: string;
    value: number;
    label: string;
    order: number;
  }>;
}
