import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-box',
  templateUrl: './confirmBox.component.html',
  styleUrls: ['./confirmBox.component.scss']
})
export class ConfirmBoxComponent implements OnInit {
  @Input() button = 'Discard';
  @Input() header = 'You Have Unsaved Changes';
  @Input() message =
    'By discarding this idea you will lose any progress on it. Are you sure you would like to proceed?';
  @Output() outPutResult = new EventEmitter<any>();

  constructor(private ngbModal: NgbModal) {}

  ngOnInit() {}

  public confirm() {
    this.outPutResult.emit({ confirm: true });
  }

  public close() {
    this.outPutResult.emit({ confirm: false });
  }
}
