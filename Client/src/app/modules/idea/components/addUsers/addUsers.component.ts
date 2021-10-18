import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-addUsers',
  templateUrl: './addUsers.component.html',
  styleUrls: ['./addUsers.component.scss']
})
export class AddUserComponent implements OnInit {
  @Input() type;
  @Input() exclude;
  @Output() closePopup = new EventEmitter<any>();
  @Output() data = new EventEmitter<any>();
  public customMessage = false;
  public dataSet = {
    users: [],
    message: ''
  };
  public message;
  constructor(private modalService: NgbModal) {}
  ngOnInit() {}

  toggleMessage() {
    this.customMessage = !this.customMessage;
  }

  close() {
    this.closePopup.emit(true);
  }

  selectedUsers(event) {
    this.dataSet.users = event;
  }

  save() {
    this.dataSet.message = this.message;
    this.data.emit(this.dataSet);
  }
}
