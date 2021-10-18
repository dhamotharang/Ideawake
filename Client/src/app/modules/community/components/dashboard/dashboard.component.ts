import * as _ from 'lodash';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AddEditDashboardComponent } from '../add-edit-dashboard/add-edit-dashboard.component';
import { CreateGadgetComponent } from '../create-gadget/create-gadget.component';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { GADGET_TYPES } from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardId;
  dashboard;
  gadgets;
  gadgetTypes = GADGET_TYPES;

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private dashboardApi: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDashboardId();
  }

  getDashboardId() {
    this.route.params.subscribe((params) => {
      this.dashboardId = params.id;
      this.getDashboard();
    });
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'post-idea-modal'
    });
  }

  openEditDashboard() {
    const modalRef = this.modalService.open(AddEditDashboardComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });

    const instance: AddEditDashboardComponent = modalRef.componentInstance;
    instance.dashboard = this.dashboard;
    instance.added.subscribe(() => this.getDashboard());
  }

  private async getDashboard() {
    try {
      this.dashboard = _.get(
        await this.dashboardApi.getDashboard(this.dashboardId).toPromise(),
        'response'
      );

      if (!this.dashboard) {
        this.router.navigateByUrl('/error/404');
      } else {
        this.getDashBoardGadgets();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getDashBoardGadgets() {
    this.gadgets = _.get(
      await this.dashboardApi
        .getDashboardGadgets({ dashboard: this.dashboardId, isDeleted: false })
        .toPromise(),
      'response'
    );
  }

  openCreateGadget() {
    const modalRef = this.modalService.open(CreateGadgetComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });

    const instance: CreateGadgetComponent = modalRef.componentInstance;
    instance.dashboard = this.dashboard;
    instance.added.subscribe(() => this.getDashBoardGadgets());
  }
}
