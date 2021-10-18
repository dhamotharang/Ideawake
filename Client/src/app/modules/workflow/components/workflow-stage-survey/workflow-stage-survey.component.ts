import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-workflow-stage-survey',
  templateUrl: './workflow-stage-survey.component.html',
  styleUrls: ['./workflow-stage-survey.component.scss']
})
export class WorkflowStageSurveyComponent implements OnInit {
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this.modalService
      .open(content, {
        windowClass: 'custom-field-modal',
        ariaLabelledBy: 'modal-basic-title',
        beforeDismiss: this.beforeDismiss
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
  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }
}
