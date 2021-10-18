import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ECONNRESET } from 'constants';
import { AppState, STATE_TYPES } from '../../../../store';
import { ENTITY_VISIBILITIES } from '../../../../utils';
import { forEach } from 'lodash';
import { OpportunityApiService } from '../../../../services';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-idea-bulk-edit-settings',
  templateUrl: './idea-bulk-edit-settings.component.html',
  styleUrls: ['./idea-bulk-edit-settings.component.scss']
})
export class IdeaBulkEditSettingsComponent implements OnInit {
  @Input() type;
  @Output() closePopup = new EventEmitter<any>();
  @Output() data = new EventEmitter<any>();

  selectedGroups;
  entityVisibilitySetting;
  entityExperienceSetting;
  entityVisibilities = ENTITY_VISIBILITIES;
  currentVisibility;
  selected;
  experienceSettingsCount;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private opportunityApi: OpportunityApiService
  ) {}

  ngOnInit() {
    this.selected = this.ngRedux.getState().ideasState.list.selected;
    this.getOpportunitySettingsCount();
  }

  getOpportunitySettingsCount() {
    this.opportunityApi
      .getOpportunitySettingsCount({
        opportunityIds: this.selected,
        type: this.type
      })
      .subscribe((res: any) => {
        this.experienceSettingsCount = res.response.length
          ? res.response.length
          : 0;
      });
  }

  getSelectedGroups(event) {
    this.selectedGroups = [];
    forEach(event, (val) => {
      this.selectedGroups.push(parseInt(val.id, 10));
      this.entityVisibilitySetting = { groups: this.selectedGroups };
    });
  }

  visibilityChangedHandler(event: any) {
    if (event.target.value === ENTITY_VISIBILITIES.GROUPS) {
      this.currentVisibility = this.entityVisibilities.GROUPS;
      this.entityVisibilitySetting = { groups: this.selectedGroups };
    } else {
      this.currentVisibility = event.target.value;
      this.entityVisibilitySetting = {
        [event.target.value]: true
      };
    }
  }

  entityExperienceChangedHandler(event: any) {
    this.entityExperienceSetting = {
      [event.target.name]: event.target.value === 'true' ? true : false
    };
  }

  close() {
    this.closePopup.emit(true);
  }

  save() {
    const dataSet =
      this.type === 'VISIBILITY'
        ? { entityVisibilitySetting: this.entityVisibilitySetting }
        : { entityExperienceSetting: this.entityExperienceSetting };
    this.data.emit(dataSet);
  }
}
