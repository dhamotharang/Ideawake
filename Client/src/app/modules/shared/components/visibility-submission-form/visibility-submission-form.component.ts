import { cloneDeep, get, map } from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'app-visibility-submission-form',
  templateUrl: './visibility-submission-form.component.html',
  styleUrls: ['./visibility-submission-form.component.scss']
})
export class VisibilitySubmissionFormComponent implements OnInit, OnChanges {
  @Output() visibilitySettings = new EventEmitter();
  @Input() public submissionVisibilitySetting;

  submissionObj = {
    groups: [],
    public: true,
    private: false,
    specificGroups: false
  };

  selectGroups = false;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    this.submissionObj.groups = map(
      get(this.submissionVisibilitySetting, 'groups', []),
      (g) => ({
        id: g.toString(),
        type: 'Group'
      })
    );
    this.submissionObj.public = get(
      this.submissionVisibilitySetting,
      'public',
      true
    );
    this.submissionObj.private = get(
      this.submissionVisibilitySetting,
      'private',
      false
    );
    this.submissionObj.specificGroups = this.submissionObj.groups.length !== 0;
    if (!this.submissionObj.public && !this.submissionObj.specificGroups) {
      this.submissionObj.private = true;
    }
    this.formatVisibiltySubmissionData();
  }

  changeVisibilitySettings(checked: string) {
    this.submissionObj[checked] = !this.submissionObj[checked];

    for (const key in this.submissionObj) {
      if (this.submissionObj.hasOwnProperty(key)) {
        if (!Array.isArray(this.submissionObj[key]) && key !== checked) {
          this.submissionObj[key] = false;
        }
      }
    }
    this.formatVisibiltySubmissionData();
  }

  formatVisibiltySubmissionData() {
    const s = cloneDeep(this.submissionObj);
    if (!s.specificGroups) {
      s.groups = [];
    } else {
      s.groups = map(s.groups, (g) => parseInt(g.id, 10));
    }
    delete s.specificGroups;
    this.visibilitySettings.emit(s);
  }
}
