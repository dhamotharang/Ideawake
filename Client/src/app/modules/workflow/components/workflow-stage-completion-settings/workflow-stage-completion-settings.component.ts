import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-workflow-stage-completion-settings',
  templateUrl: './workflow-stage-completion-settings.component.html',
  styleUrls: ['./workflow-stage-completion-settings.component.scss']
})
export class WorkflowStageCompletionSettingsComponent implements OnInit {
  constructor(private modalService: NgbModal) {}

  minimumResponse = false;
  timeLimit = false;

  toggleCompletionSettings() {
    this.minimumResponse = !this.minimumResponse;
  }

  toggleTimeLimit() {
    this.timeLimit = !this.timeLimit;
  }

  closeResult: string;

  ngOnInit() {}

  open(content) {
    this.modalService
      .open(content, {
        size: 'lg',
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

  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
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
}
