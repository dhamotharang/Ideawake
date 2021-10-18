import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardService, EntityApiService } from '../../../../services';

import { ENTITY_TYPE } from '../../../../utils';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-configure-gadget',
  templateUrl: './configure-gadget.component.html',
  styleUrls: ['./configure-gadget.component.scss']
})
export class ConfigureGadgetComponent implements OnInit {
  @Input() gadgetType;
  @Input() dashboard;
  @Output() added = new EventEmitter<void>();

  entitiesTypes = ENTITY_TYPE;
  entity;
  selectedEntity;
  opportunityFilter = {};
  appliedFilters;

  constructor(
    public modal: NgbActiveModal,
    private dashboardApi: DashboardService,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {
    this.selectEntity(ENTITY_TYPE.IDEA);
  }

  selectEntity(selectedEntity) {
    this.selectedEntity = selectedEntity;
    this.entity = this.entityApi.getEntity(selectedEntity);
  }

  async createWidget() {
    await this.dashboardApi
      .addGadget({
        dashboard: this.dashboard.id,
        entityType: this.entity.id,
        widgetType: this.gadgetType,
        configData: {
          opportunityFilter: this.opportunityFilter,
          graphDataPoint: 'opportunityType'
        }
      })
      .toPromise();

    this.added.emit();
    this.modal.close();
  }

  applyFilters(filters) {
    this.appliedFilters = { ...filters };
    this.mapFilters();
  }

  private mapFilters() {
    const filters = _.cloneDeep(this.appliedFilters);

    filters.opportunityTypes = _.map(filters.opportunityTypes, 'id');
    filters.statuses = _.map(filters.statuses, 'id');
    filters.tags = _.map(filters.tags, 'id');
    filters.workflow = _.get(filters.workflow, 'id');
    filters.stage = _.get(filters.stage, 'id');

    if (_.isEmpty(filters.tags)) {
      delete filters.tags;
    }
    if (_.isEmpty(filters.opportunityTypes)) {
      delete filters.opportunityTypes;
    }
    if (_.isEmpty(filters.customFields)) {
      delete filters.customFields;
    }
    if (_.isEmpty(filters.stage)) {
      delete filters.stage;
    }
    if (_.isEmpty(filters.workflow)) {
      delete filters.workflow;
    }

    if (_.isEmpty(filters.statuses)) {
      delete filters.statuses;
    }

    this.opportunityFilter = { ...filters };
  }
}
