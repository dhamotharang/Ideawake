import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-community-integrations',
  templateUrl: './community-integrations.component.html',
  styleUrls: ['./community-integrations.component.scss']
})
export class CommunityIntegrationsComponent implements OnInit {
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this.modalService
      .open(content, {
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
