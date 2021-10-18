import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-updates-modal',
  templateUrl: './updates-modal.component.html',
  styleUrls: ['./updates-modal.component.scss']
})
export class UpdatesModalComponent implements OnInit {
  closeResult: string;
  @Input() level = 'community';
  @Input() announcement;

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  dismissModal() {
    this.modalService.dismissAll();
    this.announcement = null;
  }
}
