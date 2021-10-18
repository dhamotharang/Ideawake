import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { filter, get, isEmpty, isBoolean } from 'lodash';
@Component({
  selector: 'app-applied-filters',
  templateUrl: './applied-filters.component.html',
  styleUrls: ['./applied-filters.component.scss']
})
export class AppliedFiltersComponent implements OnChanges {
  @Input() filters;
  @Input() pageType;
  @Input() selectedView;
  @Input() onTables = false;
  @Input() hideLabelButtons = false;
  @Output() filterOutput = new EventEmitter();
  objectKeys = Object.keys;
  count = 0;
  public opportunityFilters = {
    postedByMe: 'Posted By Me',
    votedFor: "I've Voted For",
    followedByMe: 'Followed By Me',
    bookmarkedByMe: 'Bookmarked By Me',
    ownByMe: 'Owned By Me',
    search: 'Text Search'
  };
  constructor() {}
  ngOnChanges() {
    if (this.filters) {
      this.refreshFilter();
    }
  }

  refreshFilter() {
    let tags = 0;
    let opportunityTypesCount = 0;
    let workflowCount = 0;
    let stageCount = 0;
    let challengesCount = 0;
    let statusesCount = 0;
    let customFieldsCount = 0;
    let other = 0;
    for (const key of Object.keys(this.filters)) {
      if (key === 'tags') {
        tags = this.filters[key].length || 0;
      } else if (key === 'opportunityTypes') {
        opportunityTypesCount = this.filters[key].length || 0;
      } else if (key === 'statuses') {
        statusesCount = this.filters[key].length || 0;
      } else if (key === 'workflow' && this.filters[key].id) {
        workflowCount = 1;
      } else if (key === 'stage' && this.filters[key].id) {
        stageCount = 1;
      } else if (key === 'challenges') {
        challengesCount = this.filters[key].length || 0;
      } else if (key === 'customFields') {
        customFieldsCount = this.filters[key].length || 0;
      } else if (this.opportunityFilters[key]) {
        other++;
      }
    }
    this.count =
      tags +
      opportunityTypesCount +
      workflowCount +
      stageCount +
      challengesCount +
      other +
      customFieldsCount +
      statusesCount;
  }

  removeOther(key) {
    delete this.filters[key];
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeTag(tag) {
    this.filters.tags = filter(this.filters.tags, (value) => {
      return value.id !== tag.id;
    });
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeCustomField(cf) {
    this.filters.customFields = filter(this.filters.customFields, (value) => {
      return value.customField !== cf.customField;
    });
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeWorkflow() {
    delete this.filters.workflow;
    delete this.filters.stage;
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeStage() {
    delete this.filters.stage;
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeChallenge(challenge) {
    this.filters.challenges = filter(this.filters.challenges, (value) => {
      return value.id !== challenge.id;
    });
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeOpportunityTypes(opportunityTypes) {
    this.filters.opportunityTypes = filter(
      this.filters.opportunityTypes,
      (value) => {
        return value.id !== opportunityTypes.id;
      }
    );
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  removeStatus(status) {
    this.filters.statuses = filter(this.filters.statuses, (value) => {
      return value.id !== status.id;
    });
    this.filterOutput.emit(this.filters);
    this.refreshFilter();
  }

  filterDataDisplay(key) {
    const value = get(this.filters, key);
    if (!isEmpty(value) && !isBoolean(value)) {
      return ` - ${value}`;
    } else {
      return ``;
    }
  }

  saveButton() {
    return isEmpty(this.selectedView) ? true : false;
  }
}
