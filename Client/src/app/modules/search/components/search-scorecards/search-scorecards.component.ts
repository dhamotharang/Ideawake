import {
  Component,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
  Input,
  SimpleChanges
} from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import { ReviewCriteriaApiService } from '../../../../services';
import { EVALUATION_TYPES_ABBREVIATION } from '../../../../utils';
import * as _ from 'lodash';
@Component({
  selector: 'app-search-scorecards',
  templateUrl: './search-scorecards.component.html',
  styleUrls: ['./search-scorecards.component.scss']
})
export class SearchScorecardsComponent implements OnInit, OnChanges {
  @Input() selectedCriteria = [];
  @Input() reload = false;
  @Output() selected = new EventEmitter<any>();
  text;
  types = EVALUATION_TYPES_ABBREVIATION;
  data = [];
  currentUser = this.ngRedux.getState().userState;
  selectionWeight = 0;
  selectedQuestions = [];
  constructor(
    private ngRedux: NgRedux<AppState>,
    private reviewCriteriaApiService: ReviewCriteriaApiService
  ) {}
  ngOnInit() {
    this.searchTerm();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'selectedCriteria': {
            this.selectedQuestions = _.cloneDeep(this.selectedCriteria);
            this.searchTerm();
            break;
          }
          case 'reload': {
            if (this.reload) {
              this.searchTerm();
              setTimeout(() => {
                this.reload = false;
              }, 100);
            }
            break;
          }
        }
      }
    }
  }

  filterSelections() {
    const ids = _.map(this.selectedQuestions, 'id');
    this.selectionWeight = _.sumBy(this.selectedQuestions, 'criteriaWeight');
    this.data = _.filter(this.data, (value) => {
      return !_.includes(ids, value.id);
    });
  }

  searchTerm(searchText?) {
    let search = {};
    if (searchText) {
      search = { title: searchText };
    }
    const params = {
      community: this.currentUser.currentCommunityId,
      isDeleted: false,
      ...search
    };
    this.reviewCriteriaApiService.getAll(params).subscribe((res: any) => {
      this.data = res.response;
      const question = _.find(this.data, { id: this.reload });
      const alreadySelected = _.find(this.selectedQuestions, {
        id: this.reload
      });
      if (this.reload && !_.isEmpty(question) && _.isEmpty(alreadySelected)) {
        this.selectField(question);
      }
      this.filterSelections();
    });
  }

  selectField(selection) {
    this.selectedQuestions.push(selection);
    this.selectedQuestions = _.uniqBy(this.selectedQuestions, 'id');
    this.filterSelections();
    this.selected.emit(this.selectedQuestions);
  }

  getTooltip(data) {
    let tempVar = '';
    _.forEach(_.get(data, 'criteriaObject.data', []), (value) => {
      tempVar += `<div class="row">
          <div class="col-7">
            <p class="mb-0">
              ${value.label}
            </p>
          </div>
          <div class="col-5">
            <p class="mb-0">${value.value}</p>
          </div>
        </div>
        <hr class="my-1" />`;
    });
    return `<div class="enlargePopover">
        ${tempVar}
    </div>`;
  }

  getWeight(criteriaWeight) {
    const total =
      this.selectionWeight + criteriaWeight > 0
        ? this.selectionWeight + criteriaWeight
        : 1;
    return _.round((criteriaWeight / total) * 100, 2);
  }
}
