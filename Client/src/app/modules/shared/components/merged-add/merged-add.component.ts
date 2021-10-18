import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-merged-add',
  templateUrl: './merged-add.component.html',
  styleUrls: ['./merged-add.component.scss']
})
export class MergedAddComponent implements OnInit {
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;

  viewDetails = false;

  toggleDetails() {
    this.viewDetails = !this.viewDetails;
  }

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
