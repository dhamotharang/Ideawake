import { ApiService } from '../backend.service';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { find } from 'lodash';

@Injectable()
export class EntityApiService {
  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  getEntities(params?) {
    return this.apiService.get('/entity', params);
  }

  getEntityExperienceSetting(params?) {
    return this.apiService.get('/entityExperienceSetting', params);
  }

  getEntityVisibilitySetting(params?) {
    return this.apiService.get('/entity-visibility-setting', params);
  }

  getEntity(entityType: string) {
    return find(this.ngRedux.getState().entitiesState.entities, [
      'abbreviation',
      entityType
    ]);
  }

  getAllEntities() {
    return this.ngRedux.getState().entitiesState.entities;
  }
}
