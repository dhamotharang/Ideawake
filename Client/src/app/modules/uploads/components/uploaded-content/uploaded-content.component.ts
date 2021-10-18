import { AppState, STATE_TYPES } from '../../../../store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ApiService } from '../../../../services';
import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';
import { remove } from 'lodash';

@Component({
  selector: 'app-uploaded-content',
  templateUrl: './uploaded-content.component.html',
  styleUrls: ['./uploaded-content.component.scss']
})
export class UploadedContentComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  files: any = [];
  @Output() file = new EventEmitter<any>();
  currentUserData;
  @Input() from = 'challenge';

  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((res: any) => {
        this.currentUserData = res;
        this.apiService
          .get(
            `/user-attachment?user=${this.currentUserData.user.id}&community=${this.currentUserData.currentCommunityId}`
          )
          .subscribe((userAttachments: any) => {
            this.files = userAttachments.response;
          });
      });
  }

  selectFile(fileObject) {
    this.files.forEach((element) => {
      if (element.url !== fileObject.url) {
        element.isSelected = 0;
      }
    });

    if (fileObject.isSelected === 1) {
      fileObject.isSelected = 0;
      this.file.emit(null);
    } else {
      fileObject.isSelected = 1;
      fileObject.userAttachment = fileObject.id;
      this.file.emit(fileObject.url);
    }
  }

  deleteMedia(fileObject) {
    remove(this.files, (f: any) => f.url !== fileObject.url);
  }
}
