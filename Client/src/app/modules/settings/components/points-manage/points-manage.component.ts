import { cloneDeep } from 'lodash';

import { Component, OnInit } from '@angular/core';

import {
  EntityApiService,
  NotificationService,
  SettingsApiService
} from '../../../../services';

@Component({
  selector: 'app-points-manage',
  templateUrl: './points-manage.component.html',
  styleUrls: ['./points-manage.component.scss']
})
export class PointsManageComponent implements OnInit {
  isSearching;
  entityActions;
  backupEntityActions;
  isEditable;

  EntityVowels = {
    opportunity: 'an',
    comment: 'a',
    challenge: 'a',
    user: 'a'
  };

  ActionCompositions = {
    Post: '',
    Upvote: 'on',
    Comment: 'on'
  };

  constructor(
    private notifier: NotificationService,
    private settingsApi: SettingsApiService
  ) {
    this.isSearching = false;
    this.isEditable = false;
  }

  ngOnInit() {
    this.isSearching = true;
    this.getCommunityPoints();
  }

  private getCommunityPoints() {
    this.settingsApi.getCommunityPoints().subscribe((res: any) => {
      this.entityActions = res.response;
      this.backupEntityActions = cloneDeep(this.entityActions);
    });
  }

  savePoints() {
    this.settingsApi
      .saveCommunityPoints({ data: this.entityActions })
      .subscribe(
        (res: any) => {
          this.backupEntityActions = cloneDeep(this.entityActions);
          this.isEditable = false;
          this.notifier.showSuccess('Experience points successfully updated');
        },
        (err) => this.notifier.showError('Something Went Wrong')
      );
  }

  cancelEditing() {
    this.entityActions = cloneDeep(this.backupEntityActions);
    this.isEditable = false;
  }
}
