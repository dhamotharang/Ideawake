export interface SearchResultInterface {
  total: number;
  results: Array<{ index: string; result: {} }>;
}
