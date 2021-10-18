import { SearchResultTypeEnum } from '../../../enum';

export interface SearchResponseInterface {
  results: Array<{ type: SearchResultTypeEnum; data: {} }>;
  count: number;
}
