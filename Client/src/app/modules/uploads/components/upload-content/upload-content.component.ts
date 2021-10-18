import * as _ from 'lodash';
import { Subscription } from 'rxjs';

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
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';

import { LOAD_ALL_FILES } from '../../../../actions';
import { NotificationService, UploadApiService } from '../../../../services';
import {
  AppState,
  creator,
  Files,
  STATE_TYPES,
  UserState
} from '../../../../store';
import { DEFAULT_PRELOADED_IMAGE, ENTITY_FOLDER } from '../../../../utils';

@Component({
  selector: 'app-upload-content',
  templateUrl: './upload-content.component.html',
  styleUrls: ['./upload-content.component.scss']
})
export class UploadContentComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() filesForUploadContent;
  @Input() inModal = true;
  @Input() modalRef;
  @Input() from = 'idea';
  @Input() folder = ENTITY_FOLDER.OPPORTUNITY;

  @Output() update = new EventEmitter<void>();
  @Output() challengeBriefFile = new EventEmitter<any>();

  files = [];
  uploads = [];
  selectedFiles = [];
  currentUserData: UserState;
  backupSelectedFiles = [];
  opener: string;
  uploadIndex = 0;

  private sub1: Subscription;
  private sub2: Subscription;

  constructor(
    private renderer: Renderer2,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private uploadApi: UploadApiService
  ) {}

  ngOnInit() {
    this.opener = `${this.from}Files`;
    this.backupSelectedFiles = _.cloneDeep(
      _.get(this.ngRedux.getState(), `filesState[${this.opener}].selected`)
    );

    this.updateFiles();
    this.getCurrentUserAttachments();
  }

  private updateFiles() {
    this.sub1 = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((state: Files) => {
        if (
          state[this.opener] &&
          state[this.opener].selected &&
          state[this.opener].selected.length
        ) {
          this.selectedFiles = _.orderBy(
            state[this.opener].selected,
            ['selected'],
            ['desc']
          );
        }
        if (state.all && state.all.length) {
          this.files = state.all;
        }
        this.updateFilesArray();
      });
  }

  private getCurrentUserAttachments() {
    this.sub2 = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: UserState) => {
        this.currentUserData = state;
        this.uploadApi
          .getUserAttachments({
            userId: state.user.id,
            communityId: state.currentCommunityId
          })
          .subscribe((res: any) => {
            this.files = _.orderBy(res.response, ['selected'], ['desc']);
            this.updateFilesArray();
          });
      });
  }

  private getSignedUrl(file) {
    return this.uploadApi.getSignedUrl(this.folder, file).toPromise();
  }

  private updateUserBucket(file, response) {
    return this.uploadApi
      .updateUserBucket({
        user: this.ngRedux.getState().userState.user.id,
        attachmentType: _.first(file.type.split('/')),
        url: response.bucketPath + response.fileName,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .toPromise();
  }

  private updateState(file, response, userBucket) {
    const tmpObject = {
      name: response.fileName,
      size: Math.ceil(file.size / 1024),
      attachmentType: _.first(file.type.split('/')),
      extension: _.nth(file.type.split('/'), 1).toUpperCase(),
      fontawesomeIcon: _.first(file.type.split('/')),
      url: response.bucketPath + response.fileName,
      isSelected: 1,
      id: userBucket.id,
      userAttachment: userBucket.id
    };

    this.files.unshift({ ...tmpObject });
    this.selectedFiles.unshift({ ...tmpObject });

    this.selectedFiles = _.orderBy(this.selectedFiles, ['selected'], ['desc']);
    this.files = _.orderBy(this.files, ['selected'], ['desc']);

    this.ngRedux.dispatch({
      type: LOAD_ALL_FILES,
      all: this.files
    });
    this.ngRedux.dispatch({
      type: creator(this.from),
      selected: this.selectedFiles
    });
  }

  private uploadOnSignedUrl(file, response) {
    const index = this.uploadIndex++;
    this.uploadApi.uploadOnSignedUrl(response.urls, file).subscribe(
      async (event1: HttpEvent<any>) => {
        switch (event1.type) {
          case HttpEventType.Sent:
            this.uploads[index].uploading = true;
            break;
          case HttpEventType.UploadProgress:
            this.uploads[index].progress = Math.round(
              (event1.loaded / event1.total) * 100
            );
            break;
          case HttpEventType.Response:
            this.uploads[index].uploading = false;
            const userBucketRes: any = await this.updateUserBucket(
              file,
              response
            );
            this.updateState(file, response, userBucketRes.response);
            break;
        }
      },
      (err: HttpErrorResponse) => {
        this.uploads[index].uploading = false;
        this.notifier.showError('Something Went Wrong');
      }
    );
  }
  async uploadFile(files) {
    for (const file of files) {
      const res: any = await this.getSignedUrl(file);
      this.uploads.push({
        progress: 0,
        uploading: false
      });
      this.uploadOnSignedUrl(file, res.response);
    }
  }

  deleteAttachment(index) {
    this.files.splice(index, 1);
  }

  selectFile(fileObject, fileContainer) {
    const foundIndex = _.findIndex(
      this.selectedFiles,
      (o) => o.url === fileObject.url
    );

    if (foundIndex !== -1) {
      fileObject.isSelected = false;
      this.renderer.removeClass(fileContainer, 'contentContainerSelected');
      this.selectedFiles.splice(foundIndex, 1);
    } else {
      fileObject.isSelected = true;
      fileObject.userAttachment = fileObject.id;
      this.renderer.addClass(fileContainer, 'contentContainerSelected');
      this.selectedFiles.push(fileObject);
    }

    this.selectedFiles = _.orderBy(this.selectedFiles, ['selected'], ['desc']);
    this.files = _.orderBy(this.files, ['selected'], ['desc']);
    this.ngRedux.dispatch({
      type: creator(this.from),
      selected: this.selectedFiles
    });
    this.ngRedux.dispatch({
      type: LOAD_ALL_FILES,
      all: this.files
    });
  }
  deleteMedia(fileObject) {
    const foundIndexSelected = _.findIndex(
      this.selectedFiles,
      (o) => o.url === fileObject.url
    );

    const foundIndexAll = _.findIndex(
      this.files,
      (o) => o.url === fileObject.url
    );

    if (foundIndexSelected !== -1) {
      this.selectedFiles.splice(foundIndexSelected, 1);

      this.selectedFiles = _.orderBy(
        this.selectedFiles,
        ['selected'],
        ['desc']
      );
      this.files = _.orderBy(this.files, ['selected'], ['desc']);
    }

    if (foundIndexAll !== -1) {
      this.files.splice(foundIndexAll, 1);
      this.files = _.orderBy(this.files, ['selected'], ['desc']);
    }
  }
  updateFilesArray() {
    _.forEach(this.files, (val) => {
      const foundIndexSelected = _.findIndex(
        this.selectedFiles,
        (o) => o.url === val.url
      );
      val.isSelected = foundIndexSelected !== -1;
    });
  }
  onInsertMedia() {
    this.update.emit();
    if (this.from === 'challengeBrief') {
      this.challengeBriefFile.emit(this.selectedFiles);
    }
    this.modalRef.dismiss();
  }

  close(by) {
    this.ngRedux.dispatch({
      type: creator(this.from),
      selected: this.backupSelectedFiles
    });
    this.ngRedux.dispatch({
      type: LOAD_ALL_FILES,
      all: this.files
    });
    this.modalRef.dismiss();
  }
  ngOnDestroy() {
    this.uploads = null;
    if (this.sub2) {
      this.sub2.unsubscribe();
    }

    if (this.sub1) {
      this.sub1.unsubscribe();
    }
  }
}
