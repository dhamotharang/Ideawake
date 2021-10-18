import { find } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NotificationService, WorkflowApiService } from '../../../../services';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-workflow-list-container',
  templateUrl: './workflow-list-container.component.html',
  styleUrls: ['./workflow-list-container.component.scss']
})
export class WorkflowListContainerComponent implements OnInit {
  closeResult: string;
  id = 0;
  workflows = [];
  public currentUser = this.ngRedux.getState().userState;
  public title = '';
  public description = '';
  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private workflowApiService: WorkflowApiService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCommunityWorkflows();
  }

  navigateTo(workflow) {
    this.router.navigate(['/idea/cards'], {
      queryParams: {
        sideFilter: JSON.stringify({
          workflow: { id: workflow.id, title: workflow.title }
        })
      }
    });
  }

  getCommunityWorkflows() {
    const params = {
      community: this.currentUser.currentCommunityId,
      isDeleted: false
    };
    this.workflowApiService
      .getAllCommunityWorkflows(params)
      .subscribe((res: any) => {
        this.workflows = res.response;
      });
  }

  open(content, id?) {
    this.id = id;
    if (this.id) {
      const editWorkflow = find(this.workflows, ['id', id]);
      this.title = editWorkflow.title;
      this.description = editWorkflow.description;
    }
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title'
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  delete() {
    this.modalService.dismissAll();
    this.workflowApiService.deleteById(this.id).subscribe((res: any) => {
      this.id = null;
      this.getCommunityWorkflows();
      this.notification.showInfo('Workflow successfully deleted', {
        positionClass: 'toast-bottom-center'
      });
    });
  }

  create() {
    const params = {
      title: this.title,
      description: this.description,
      community: this.currentUser.currentCommunityId
    };
    this.modalService.dismissAll();
    this.workflowApiService.createNew(params).subscribe((res: any) => {
      this.title = '';
      this.description = '';
      this.notification.showSuccess('Workflow added successfully.',{
        positionClass: 'toast-bottom-center'
      });
      this.getCommunityWorkflows();
    });
  }

  Update() {
    const params = {
      title: this.title,
      description: this.description,
      community: this.currentUser.currentCommunityId
    };
    this.modalService.dismissAll();
    this.workflowApiService
      .updateById(this.id, params)
      .subscribe((res: any) => {
        this.title = '';
        this.description = '';
        this.id = null;
        this.notification.showSuccess('Workflow updated successfully.', {
          positionClass: 'toast-bottom-center'
        });
        this.getCommunityWorkflows();
      });
  }
}
