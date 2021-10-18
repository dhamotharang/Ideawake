import { Injectable } from '@angular/core';
import { ApiService } from '../backend.service';

@Injectable()
export class PrizeApiService {
  constructor(private apiService: ApiService) {}

  getPrizeCategory(params?) {
    return this.apiService.get(`/prize/category`, params);
  }

  getPrizes(params?) {
    return this.apiService.get(`/prize`, params);
  }

  getPrizeById(id) {
    return this.apiService.get(`/prize/${id}`);
  }

  getPrizeCandidates(id) {
    return this.apiService.get(`/prize/candidates/${id}`);
  }

  postAwardPrize(body) {
    return this.apiService.post(`/prize/award`, body);
  }

  postPrize(body) {
    return this.apiService.post(`/prize`, body);
  }

  updatePrize(id, body) {
    return this.apiService.patch(`/prize/${id}`, body);
  }

  deletePrize(id) {
    return this.apiService.delete(`/prize/${id}`);
  }
}
