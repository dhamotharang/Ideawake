import { Injectable } from '@angular/core';
import { ApiService } from '../backend.service';

@Injectable()
export class ElasticSearchApiService {
  constructor(private apiService: ApiService) {}

  navigationSearch(params?) {
    return this.apiService.get('/search', params);
  }
}
