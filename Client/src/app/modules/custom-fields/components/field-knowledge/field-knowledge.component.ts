import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-field-knowledge',
  templateUrl: './field-knowledge.component.html',
  styleUrls: ['./field-knowledge.component.scss']
})
export class FieldKnowledgeComponent implements OnInit {
  closeResult: string;
  beforeDismiss: () => boolean | Promise<boolean>;

  constructor(private modalService: NgbModal) {}

  addNewEntry = false;

  toggleEntry() {
    this.addNewEntry = !this.addNewEntry;
  }

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
