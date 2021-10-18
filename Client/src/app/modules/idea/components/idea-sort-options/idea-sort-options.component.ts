import * as _ from 'lodash';

import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDEA_SORT_FILTERS } from '../../../../utils';

@Component({
  selector: 'app-idea-sort-options',
  templateUrl: './idea-sort-options.component.html',
  styleUrls: ['./idea-sort-options.component.scss']
})
export class IdeaSortOptionsComponent {
  @Output() filter = new EventEmitter<string>();

  filters = IDEA_SORT_FILTERS;
  selectedFilter;

  constructor(route: ActivatedRoute) {
    const paramFilter = Object.keys(this.filters).find(
      (key) =>
        this.filters[key].sortBy === route.snapshot.queryParams.sortBy &&
        this.filters[key].sortType === route.snapshot.queryParams.sortType
    );
    if (paramFilter) {
      this.selectedFilter = this.filters[paramFilter]['languageKey'];
    } else {
      this.selectedFilter = 'Shared.Newest';
    }
  }

  selectSortFilter(filter) {
    this.selectedFilter = filter.value.languageKey;
    this.filter.emit(filter.value);
  }
}
