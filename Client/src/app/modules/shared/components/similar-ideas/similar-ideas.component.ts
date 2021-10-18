import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';

import { ApiService } from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';

@Component({
  selector: 'app-similar-ideas',
  templateUrl: './similar-ideas.component.html',
  styleUrls: ['./similar-ideas.component.scss']
})
export class SimilarIdeasComponent implements OnInit, DoCheck, OnDestroy {
  similarIdeas;
  communityId;

  @Input() titleValue;
  previousTitleLength = 0;

  private sub: Subscription;

  constructor(
    private apiService: ApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.communityId = state.currentCommunityId;
      });
  }

  ngDoCheck() {
    if (this.previousTitleLength < this.titleValue.length) {
      this.search();
    }
  }

  search() {
    if (this.titleValue.length > 4) {
      this.apiService
        .get(
          `/opportunity/similar-opportunities?community=${this.communityId}&title=${this.titleValue}`
        )
        .subscribe((res: any) => {
          this.similarIdeas = res.response[0];
        });
    }
    this.previousTitleLength++;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
