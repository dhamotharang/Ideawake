import * as _ from 'lodash';

import { ApiService, EntityApiService } from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Output
} from '@angular/core';

import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-tags',
  templateUrl: './search-tags.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./search-tags.component.scss']
})
export class SearchTagsComponent implements OnInit, OnDestroy {
  @Input() data;
  @Output() dataEmitter = new EventEmitter<any>();
  @Output() searchTermEmitter = new EventEmitter<any>();
  @Input() placeholder = 'Start typing to search tags...';
  @Input() showAddTags = true;
  @Input() selected = [];
  @Input() entityObject;

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

    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  emitData(tags) {
    this.dataEmitter.emit(_.map(tags, (tag) => tag.id));
  }

  emitSearchTerm(term) {
    this.searchTermEmitter.emit(term.term);
  }

  addTags(term) {
    if (this.showAddTags) {
      return this.apiService
        .post('/tag', {
          name: term.replace(/ /g, ''),
          entityObjectId: this.entityType.id,
          entityType: this.entityType.id,
          community: this.communityId
        })
        .toPromise()
        .then((res: any) => {
          this.loading = false;
          this.dataEmitter.emit();
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
