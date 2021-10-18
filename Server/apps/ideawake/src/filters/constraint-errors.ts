'use strict';

interface ConstraintErrors {
  [constraintKey: string]: string;
}

export const ConstraintErrors: ConstraintErrors = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  UQ_97672ac88f789774dd47f7c8be3: 'error.unique.email',
};
