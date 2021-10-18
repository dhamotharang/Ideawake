import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ideabox-container',
  templateUrl: './ideabox-container.component.html',
  styleUrls: ['./ideabox-container.component.scss']
})
export class IdeaboxContainerComponent implements OnInit {
  closeResult: string;
  taskTitle;
  description;
  checklistTitle;
  checklistEntry;
  addNew;
  addOutcome;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}
  toggleAddNew() {}
  toggleTitle() {}
  toggleDescription() {}
  toggleChecklistTitle() {}
  toggleChecklistEntry() {}

  open(content) {
    this.modalService
      .open(content, {
        windowClass: 'ideabox-test-modal',
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
