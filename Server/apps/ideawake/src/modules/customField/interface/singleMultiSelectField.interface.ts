'use strict';

export interface SingleMultiSelectFieldInterface {
  type: string; // Will be either 'single_select' or 'multi_select'
  data: Array<{
    value: string;
    label: string;
    order: number;
  }>; // Will be array of objects of the options.
}
