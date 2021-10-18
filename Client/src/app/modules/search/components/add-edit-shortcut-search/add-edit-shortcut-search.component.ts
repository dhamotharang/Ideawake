import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';
import { AppState } from '../../../../store';
import { SharedApi, NotificationService } from '../../../../services';
import * as _ from 'lodash';
@Component({
  selector: 'app-add-edit-shortcut-search',
  templateUrl: './add-edit-shortcut-search.component.html'
})
export class AddEditShortcutSearchComponent implements OnInit {
  @Input() pageType = 'table';
  @Input() id = null;
  @Output() outputResult = new EventEmitter();
  public currentUser = this.ngRedux.getState().userState;
  public closeResult: string;
  public usersAndGroups = [];
  public permissionTypes = {
    public: 'public',
    specificGroups: 'specificGroups',
    private: 'private'
  };
  public permission = this.permissionTypes.public;
  public formValues = {
    title: '',
    bookmarkedUrl: this.router.url,
    viewType: this.pageType,
    isDefault: false,
    visibilitySettings: {
      public: true,
      private: false,
      individuals: [],
      groups: []
    }
  };
  constructor(
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private notificationService: NotificationService,
    private sharedApi: SharedApi
  ) {}

  ngOnInit() {
    this.formValues.viewType = this.pageType;
    if (this.id) {
      this.sharedApi.getSingleBookmarkedView(this.id).subscribe((res: any) => {
        this.fillEditData(res.response);
      });
    }
  }

  fillEditData(editData) {
    this.formValues = {
      title: _.get(editData, 'title', ''),
      bookmarkedUrl: _.get(editData, 'bookmarkedUrl', ''),
      viewType: _.get(editData, 'viewType'),
      isDefault: _.get(editData, 'isDefault'),
      visibilitySettings: {
        public: _.get(editData, 'visibilitySettings.public', false),
        private: _.get(editData, 'visibilitySettings.private', false),
        individuals: _.get(editData, 'visibilitySettings.individuals', []),
        groups: _.get(editData, 'visibilitySettings.groups', [])
      }
    };
    if (_.get(editData, 'visibilitySettings.public')) {
      this.permission = this.permissionTypes.public;
    } else if (_.get(editData, 'visibilitySettings.private')) {
      this.permission = this.permissionTypes.private;
    } else {
      this.permission = this.permissionTypes.specificGroups;
      _.forEach(this.formValues.visibilitySettings.groups, (value) => {
        this.usersAndGroups.push({ id: value, type: 'Group' });
      });
      _.forEach(this.formValues.visibilitySettings.individuals, (value) => {
        this.usersAndGroups.push({ id: value, type: 'User' });
      });
    }
  }

  saveView() {
    if (_.isEmpty(this.formValues.title)) {
      this.notificationService.showWarning('Enter view name before saving.');
      return false;
    }
    if (this.permission === this.permissionTypes.specificGroups) {
      if (
        _.isEmpty(this.formValues.visibilitySettings.individuals) &&
        _.isEmpty(this.formValues.visibilitySettings.groups)
      ) {
        this.notificationService.showWarning(
          'Select users and groups before saving.'
        );
        return false;
      }
    }
    if (this.id) {
      this.sharedApi
        .updateBookmarkView(this.id, this.formValues)
        .subscribe((res: any) => {
          this.notificationService.showSuccess('View updated successfully');
          this.outputResult.emit({ updated: true });
        });
    } else {
      const filtersList = this.ngRedux.getState().filterState.list.selected;
      const columnList = this.ngRedux.getState().columnState.list.selected;
      this.formValues['filterOptions'] = filtersList;
      this.formValues['columnOptions'] = columnList;
      this.sharedApi.bookmarkView(this.formValues).subscribe((res: any) => {
        this.notificationService.showSuccess('View added successfully');
        this.outputResult.emit({ created: true });
      });
    }
  }

  getAccessUsers(event) {
    const groups = _.chain(event)
      .filter({ type: 'Group' })
      .map((o) => {
        return _.parseInt(o.id);
      })
      .value();
    _.set(this.formValues, 'visibilitySettings.groups', groups);
    const individuals = _.chain(event)
      .filter({ type: 'User' })
      .map((o) => {
        return _.parseInt(o.id);
      })
      .value();
    _.set(this.formValues, 'visibilitySettings.individuals', individuals);
  }

  changePermission(type) {
    this.permission = type;
    this.formValues.visibilitySettings = {
      public: false,
      private: false,
      individuals: [],
      groups: []
    };
    if (type === this.permissionTypes.public) {
      _.set(this.formValues, 'visibilitySettings.public', true);
    } else if (type === this.permissionTypes.private) {
      _.set(this.formValues, 'visibilitySettings.private', true);
    }
  }

  hasPermission(type) {
    return this.permission === type ? true : false;
  }

  close() {
    this.outputResult.emit({ close: true });
  }
}
