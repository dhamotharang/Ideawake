import { get } from 'lodash';

import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-range-stats',
  templateUrl: './range-stats.component.html',
  styleUrls: ['./range-stats.component.scss']
})
export class RangeStatsComponent implements OnChanges {
  @Input() criteria;

  unit;
  maxScore;
  minScore;
  avgScore;

  constructor() {}

  ngOnChanges() {
    this.unit = get(this.criteria, 'criteria.criteriaObject.unit', '');
    this.avgScore = get(this.criteria, 'avgScore');
    this.maxScore = get(this.criteria, 'maxScore');
    this.minScore = get(this.criteria, 'minScore');
  }
}
