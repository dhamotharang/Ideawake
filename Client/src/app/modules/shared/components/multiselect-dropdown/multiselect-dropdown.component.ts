import { ApiService, EntityApiService } from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.scss']
})
export class MultiselectDropdownComponent implements OnInit, OnDestroy {
  @Input() data;
  @Output() dataEmitter = new EventEmitter<any>();
  @Output() searchTermEmitter = new EventEmitter<any>();
  @Input() placeholder = 'Start typing to search tags...';
  @Input() showAddTags = true;
  @Input() selected = [];

  newTag;
  loading = false;
  communityId;
  entityType;
  private sub: Subscription;

  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.communityId = state.currentCommunityId;
      });
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.IDEA).id;
  }

  emitData() {
    this.dataEmitter.emit(this.selected);
  }

  emitSearchTerm(term) {
    this.searchTermEmitter.emit(term.term);
  }

  addTags(term) {
    if (this.showAddTags) {
      return this.apiService
        .post('/tag', {
          name: term.replace(/ /g, ''),
          entityObjectId: this.entityType,
          entityType: this.entityType,
          community: this.communityId
        })
        .toPromise()
        .then((res: any) => {
          this.loading = false;
          return res.response;
        });
    }
    return this.showAddTags;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
