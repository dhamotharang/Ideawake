import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-idea-outcomes-container',
  templateUrl: './idea-outcomes-container.component.html',
  styleUrls: ['./idea-outcomes-container.component.scss']
})
export class IdeaOutcomesContainerComponent implements OnInit {
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this.modalService
      .open(content, {
        windowClass: 'outcomes-modal',
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
