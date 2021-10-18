'use strict';

export interface NumberFieldInterface {
  type: string; // Will be either 'number'
  data: {
    format: NumberFieldFormatEnum; // Will be either 'currency', 'formatted_number' or 'unformatted_number'
  }; // Will be an object in the above structure.
}

enum NumberFieldFormatEnum {
  CURRENCY = 'currency',
  FORMATTED = 'formatted_number',
  UNFORMATTED = 'unformatted_number',
}
