import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  CommentApiService,
  NotificationService,
  StorageService
} from '../../../../services';
import { Subscription, fromEvent } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { map, get, isEmpty } from 'lodash';

@Component({
  selector: 'app-comment-post',
  templateUrl: './comment-post.component.html',
  styleUrls: ['./comment-post.component.scss']
})
export class CommentPostComponent implements OnInit, AfterViewInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @ViewChild('ngMentionId', { static: false }) ngMentionId;

  @Input() comment;
  @Input() mentionUsers;
  @Input() mentionGroups;
  @Input() mentionTags;
  @Input() permissions;
  @Input() bottomPostForm = false;
  @Input() entityConfig = {
    entityObjectId: '',
    entityType: ''
  };
  currentUser;
  disablePostButton = false;

  communityId;
  mentions = [];
  tags = [];
  messageBody = '';
  anonymous = false;
  selectedFiles;
  allFiles;
  private sub: Subscription;
  queryParams: any = this.activatedRoute.snapshot.queryParams;
  reinitialize = true;

  constructor(
    private storage: StorageService,
    private activatedRoute: ActivatedRoute,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private commentApiService: CommentApiService
  ) {}

  ngOnInit() {
    this.currentUser = this.ngRedux.getState().userState;
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((filesData: Files) => {
        this.selectedFiles = filesData.commentFiles.selected;
        this.allFiles = filesData.all;
      });
    if (this.queryParams.scrollTo === 'newComment') {
      const newOpportunity = this.storage.getItem('newOpportunity');
      if (!isEmpty(newOpportunity)) {
        this.messageBody =
          get(newOpportunity, 'title', '') +
          ' - ' +
          get(newOpportunity, 'description', '');
        setTimeout(() => {
          this.storage.clearItem('newOpportunity');
        }, 4000);
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      fromEvent(
        this.ngMentionId.ngMentionId.nativeElement,
        'focusout'
      ).subscribe(() => setTimeout(() => this.expandArea(2), 100));

      fromEvent(
        this.ngMentionId.ngMentionId.nativeElement,
        'focusin'
      ).subscribe(() => this.expandArea(4));
    }, 500);
  }

  selectedMentions(id) {
    this.mentions.push(id);
  }

  selectedTags(id) {
    this.tags.push(id);
  }

  setComment(comment) {
    this.messageBody = comment;
  }

  setAnonymousStatus(anonymityStatus) {
    this.anonymous = anonymityStatus;
  }

  ngMentionTriggers(char) {
    const code = char === '@' ? 'Digit2' : 'Digit3';
    const kEvent = new KeyboardEvent('keydown', {
      key: char,
      code
    });
    this.ngMentionId.ngMentionId.nativeElement.dispatchEvent(kEvent);
    this.ngMentionId.ngMentionId.nativeElement.value += char;
    this.ngMentionId.ngMentionId.nativeElement.focus();
  }

  postComment() {
    if (this.messageBody === '') {
      this.notifier.showInfo('Alerts.EmptyComment');
      return;
    }
    this.disablePostButton = true;
    const data = {
      anonymous: this.anonymous ? 1 : 0,
      tags: this.tags,
      mentions: this.mentions,
      attachments: this.getAttachments(),
      entityObjectId: this.entityConfig.entityObjectId,
      entityType: this.entityConfig.entityType,
      message: this.messageBody
    };

    this.reinitialize = false;

    this.commentApiService.postComment(data).subscribe(
      (res) => {
        this.ngMentionId.ngMentionId.nativeElement.value = '';
        this.disablePostButton = false;
        this.mentions = [];
        this.tags = [];
        this.messageBody = '';
        this.anonymous = false;
        this.selectedFiles = [];
        this.allFiles = [];
        this.reinitialize = true;
      },
      (err) => {
        this.notifier.showError('Something Went Wrong');
      }
    );
  }

  getAttachments() {
    const attachments = map(this.selectedFiles, (file) => {
      file.userAttachment = file.id;
      return file;
    });

    return attachments;
  }

  expandArea(rows) {
    this.ngMentionId.rows = rows;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  deleteMedia(file) {}
}
