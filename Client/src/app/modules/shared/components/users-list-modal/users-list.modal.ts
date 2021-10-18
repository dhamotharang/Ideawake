import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-list-modal',
  templateUrl: './users-list.modal.html'
})
export class UsersListModalComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() users;
  @Input() dismiss;
  @Input() close;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  closeModal() {
    this.modalService.dismissAll();
  }
}
