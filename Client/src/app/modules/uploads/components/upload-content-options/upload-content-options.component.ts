import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LOAD_SELECTED_COMMENT_FILES } from '../../../../actions';
import { AppState } from '../../../../store';
import { UploadContentComponent } from '../upload-content/upload-content.component';

@Component({
  selector: 'app-upload-content-options',
  templateUrl: './upload-content-options.component.html',
  styleUrls: ['./upload-content-options.component.scss']
})
export class UploadContentOptionsComponent implements OnInit, OnChanges {
  @Input() from;
  @Input() data;
  @Input() permissions;
  @Input() simpleUploadOptions = false;
  @Input() canPostAnonymously = true;
  @Output() postAnonymously = new EventEmitter<boolean>();
  @Output() trigger = new EventEmitter<boolean>();
  @Output() allFiles = new EventEmitter<any>();

  files: any = [];
  filesForUploadContent: any = [];
  anonymousStatus = false;
  modalRef;
  randomId;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.randomId = 'str' + Math.floor(Math.random() * 10000);
    if (this.data) {
      this.anonymousStatus = this.data.anonymous === 1 ? true : false;
    }
  }

  ngOnChanges() {
    if (this.permissions && this.permissions.defaultAnonymousComments) {
      this.anonymousStatus = true;
      this.postAnonymously.emit(this.anonymousStatus);
    }
  }

  open() {
    if (!this.data) {
      this.ngRedux.dispatch({
        type: LOAD_SELECTED_COMMENT_FILES,
        selected: []
      });
    }
    this.modalRef = this.modalService.open(UploadContentComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });
    this.modalRef.componentInstance.modalRef = this.modalRef;
    this.modalRef.componentInstance.from = this.from;
  }

  addNgMentionTrigger(val) {
    this.trigger.emit(val);
  }

  onAnonymitySelection() {
    this.anonymousStatus = !this.anonymousStatus;
    this.postAnonymously.emit(this.anonymousStatus);
  }
}
