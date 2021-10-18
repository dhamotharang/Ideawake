import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-idea-tasks-container',
  templateUrl: './idea-tasks-container.component.html',
  styleUrls: ['./idea-tasks-container.component.scss']
})
export class IdeaTasksContainerComponent implements OnInit {
  closeResult: string;

  addNew = false;
  description = false;
  taskTitle = false;
  checklistTitle = false;
  checklistEntry = false;

  toggleAddNew() {
    this.addNew = !this.addNew;
  }

  toggleTitle() {
    this.taskTitle = !this.taskTitle;
  }

  toggleDescription() {
    this.description = !this.description;
  }

  toggleChecklistTitle() {
    this.checklistTitle = !this.checklistTitle;
  }

  toggleChecklistEntry() {
    this.checklistEntry = !this.checklistEntry;
  }

  constructor(private modalService: NgbModal) {}

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
