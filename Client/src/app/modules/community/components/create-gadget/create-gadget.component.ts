import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardService, EntityApiService } from '../../../../services';
// import { ConfigureGadgetComponent } from '../../components/configure-gadget/configure-gadget.component';
import { ENTITY_TYPE, GADGET_TYPES } from '../../../../utils';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-gadget',
  templateUrl: './create-gadget.component.html',
  styleUrls: ['./create-gadget.component.scss']
})
export class CreateGadgetComponent implements OnInit {
  @Input() dashboard;
  @Output() added = new EventEmitter<void>();
  gadgetTypes = GADGET_TYPES;

  disableButton = false;

  constructor(
    public modal: NgbActiveModal,
    private dashboardApi: DashboardService,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {}

  async createWidget(type) {
    this.disableButton = true;
    await this.dashboardApi
      .addGadget({
        dashboard: this.dashboard.id,
        entityType: this.entityApi.getEntity(ENTITY_TYPE.IDEA).id,
        widgetType: type,
        configData: {
          opportunityFilter: {},
          actualFilters: {}
        }
      })
      .toPromise();
    this.added.emit();
    this.disableButton = false;
  }
}
