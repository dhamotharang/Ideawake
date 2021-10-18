import { find, get, map } from 'lodash';

import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { UtilService } from '../../../../services';

@Component({
  selector: 'app-question-stats',
  templateUrl: './question-stats.component.html',
  styleUrls: ['./question-stats.component.scss']
})
export class QuestionStatsComponent implements OnChanges {
  @Input() criteria;

  public criteriaObject;
  totalResponses;
  mostSelectedResponse;
  index = 0;

  constructor(public util: UtilService) {}

  mapCriteria() {
    this.criteriaObject = map(
      get(this.criteria, 'criteria.criteriaObject.data', []),
      (c) => ({
        ...c,
        frequency: get(this.criteria, ['responseDistribution', c.key], 0),
        color: get(this.criteria, ['responseDistribution', c.key], 0)
          ? this.color()
          : ''
      })
    );
    this.totalResponses = get(this.criteria, 'totalResponses', 0);
    this.mostSelectedResponse = get(
      find(this.criteriaObject, (c) => c.key === this.getMaxKey()),
      'label'
    );
  }

  private getMaxKey() {
    let max = 0;
    let k = '';
    for (const key in get(this.criteria, 'responseDistribution', {})) {
      if (this.criteria.responseDistribution.hasOwnProperty(key)) {
        if (max <= this.criteria.responseDistribution[key]) {
          max = this.criteria.responseDistribution[key];
          k = key;
        }
      }
    }

    return k;
  }
  /*   ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'criteria': {
            if (this.criteria) {
              this.mapCriteria();
            }
          }
        }
      }
    }
  } */

  ngOnChanges() {
    this.mapCriteria();
  }

  color() {
    return this.util.changeColor(this.index++);
  }
}
