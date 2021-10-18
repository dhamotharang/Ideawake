import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-custom-field-edit-single-select',
  templateUrl: './custom-field-edit-single-select.component.html',
  styleUrls: ['./custom-field-edit-single-select.component.scss']
})
export class CustomFieldEditSingleSelectComponent implements OnInit {
  closeResult: string;
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
