import { NgRedux } from '@angular-redux/store';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType
} from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import { NotificationService, UploadApiService } from '../../../../services';
import { AppState } from '../../../../store';
import { ENTITY_FOLDER } from '../../../../utils';

@Component({
  selector: 'app-upload-single-file',
  templateUrl: './upload-single-file.component.html',
  styleUrls: ['./upload-single-file.component.scss']
})
export class UploadSingleFileComponent {
  @Output() file = new EventEmitter();
  @Output() uploading = new EventEmitter();

  @Input() modalRef;
  @Input() folder = ENTITY_FOLDER.OPPORTUNITY;
  @Input() canUpload = true;
  @Input() accept;

  @ViewChild('fileInput', { static: false }) fileInput;

  upload = {
    progress: 0,
    uploading: false
  };

  constructor(
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private uploadApi: UploadApiService
  ) {}

  async uploadFile(files) {
    for (const file of files) {
      const res: any = await this.uploadApi
        .getSignedUrl(this.folder, file)
        .toPromise();

      this.upload.progress = 0;
      this.upload.uploading = false;
      this.uploading.emit(false);
      this.uploadApi.uploadOnSignedUrl(res.response.urls, file).subscribe(
        async (event1: HttpEvent<any>) => {
          switch (event1.type) {
            case HttpEventType.Sent:
              this.upload.uploading = true;
              this.uploading.emit(true);
              break;
            case HttpEventType.UploadProgress:
              this.upload.progress = Math.round(
                (event1.loaded / event1.total) * 100
              );
              break;
            case HttpEventType.Response:
              this.upload.uploading = false;
              this.upload.progress = 0;
              this.uploading.emit(false);
              await this.uploadApi
                .updateUserBucket({
                  user: this.ngRedux.getState().userState.user.id,
                  attachmentType: file.type.split('/')[0],
                  url: res.response.bucketPath + res.response.fileName,
                  community: this.ngRedux.getState().userState
                    .currentCommunityId
                })
                .toPromise();
              this.file.emit(res.response.bucketPath + res.response.fileName);
              if (this.modalRef) {
                this.modalRef.close();
              }
              break;
          }
        },
        (err: HttpErrorResponse) => {
          this.upload.uploading = false;
          this.uploading.emit(false);
          this.upload.progress = 0;
          this.notifier.showError('Something Went Wrong');
        }
      );
    }
  }
}
