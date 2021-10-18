import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-community-container',
  templateUrl: './community-container.component.html',
  styleUrls: ['./community-container.component.scss']
})
export class CommunityContainerComponent implements OnInit {
  closeResult: string;
  addMultipleFieldGroups;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this.modalService.open(content, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
  }
}
