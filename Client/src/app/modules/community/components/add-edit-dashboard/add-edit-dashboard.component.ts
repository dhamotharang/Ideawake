import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-dashboard',
  templateUrl: './add-edit-dashboard.component.html',
  styleUrls: ['./add-edit-dashboard.component.scss']
})
export class AddEditDashboardComponent implements OnInit {
  @Input() dashboard;
  desc = true;
  edit = false;
  dashboardForm: FormGroup;

  @Output() added = new EventEmitter<void>();
  constructor(
    public modal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private dashboardApi: DashboardService,
    private router: Router,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    let title, description;
    if (this.dashboard) {
      this.edit = true;
      title = this.dashboard.title;
      description = this.dashboard.description;
      if (description) {
        this.desc = false;
      }
    }

    this.dashboardForm = this.formBuilder.group({
      title: [title, Validators.required],
      description: [description]
    });
  }

  async onSubmit() {
    if (this.dashboardForm.controls.title.errors) {
      return;
    }

    try {
      const res = await this.getMethod(this.dashboardForm.value).toPromise();

      if (this.dashboard) {
        this.notifier.showSuccess('Dashboard updated', {
          positionClass: 'toast-bottom-center'
        });
      } else {
        this.notifier.showSuccess('Alerts.DashboardCreated', {
          positionClass: 'toast-bottom-center'
        });
        this.router.navigateByUrl(
          `/community/dashboard/${_.get(res, 'response.id')}`
        );
      }
      this.added.emit();
      this.modal.close();
    } catch (e) {
      this.notifier.showError('Something occurred');
      console.log(e);
    }
  }

  private getMethod(body) {
    return this.dashboard
      ? this.dashboardApi.updateCommunityDashboard(this.dashboard.id, body)
      : this.dashboardApi.addCommunityDashboard(body);
  }
}
