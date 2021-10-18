import * as _ from 'lodash';

import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  CommentApiService,
  NotificationService,
  UtilService
} from '../../../../services';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() thread;
  @Input() tagsData;
  @Input() mentionsData;
  @Input() parentId;
  @Input() mentionGroups;
  @Input() mentionUsers;
  @Input() mentionTags;
  @Input() entityConfig;
  @Input() commentUpvotes;
  @Input() permissions;
  @Input() simpleReply = false;
  @Output() updateThread = new EventEmitter<any>();
  @ViewChild('replyBox', { static: false }) replyBox;

  currentUser;
  selectedFiles = [];
  allFiles = [];
  mentions = [];
  tags = [];
  messageBody = '';
  anonymous = false;
  disableReplyButton = false;
  modalRef;
  preMention;
  showInputField = false;

  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private ngbModal: NgbModal,
    public util: UtilService,
    public router: Router,
    private CommentApiService: CommentApiService
  ) {}

  ngOnInit() {
    this.currentUser = this.ngRedux.getState().userState.user;
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((filesData: Files) => {
        this.selectedFiles = filesData.commentFiles.selected;
        this.allFiles = filesData.all;
      });
    this.processComments();
  }

  processComments() {
    _.forEach(this.thread, async (t) => {
      t.messageHtml = await this.util.processCommentMentions(
        t.comment,
        this.mentionsData
      );
    });
  }

  selectedReplyMentions(id) {
    this.mentions.push(id);
  }

  selectedReplyTags(id) {
    this.tags.push(id);
  }

  setReply(comment) {
    this.messageBody = comment;
  }

  setAnonymousStatus(anonymityStatus) {
    this.anonymous = anonymityStatus;
  }

  ngMentionTriggers(char) {
    this.replyBox.ngMentionId.nativeElement.focus();
    const code = char === '@' ? 'Digit2' : 'Digit3';
    const kEvent = new KeyboardEvent('keydown', {
      key: char,
      code
    });
    this.replyBox.ngMentionId.nativeElement.dispatchEvent(kEvent);
    this.replyBox.ngMentionId.nativeElement.value += char;
  }

  postReply() {
    if (this.messageBody === '') {
      this.notifier.showInfo('Empty comment cannot be posted');
      return;
    }
    this.disableReplyButton = true;
    const data = {
      commentThread: this.parentId,
      tags: this.tags,
      mentions: this.mentions,
      message: this.messageBody,
      entityType: this.entityConfig.entityType,
      entityObjectId: this.entityConfig.entityObjectId,
      attachments: this.getAttachments(),
      anonymous: this.anonymous ? 1 : 0
    };

    this.CommentApiService.postComment(data).subscribe(
      (res) => {
        this.replyBox.ngMentionId.nativeElement.value = '';
        this.disableReplyButton = false;
        this.mentions = [];
        this.tags = [];
        this.messageBody = '';
        this.anonymous = false;
        this.selectedFiles = [];
        this.allFiles = [];
      },
      (err) => {
        this.notifier.showError('Something Went Wrong');
        this.disableReplyButton = false;
      }
    );
  }

  archiveComment(id) {
    this.CommentApiService.editComment(id, { isDeleted: true }).subscribe(
      (res) => {
        this.modalRef.close();
        this.updateThread.emit(true);
        this.notifier.showSuccess('Comment Archived Successfully.');
      }
    );
  }

  open(content) {
    this.modalRef = this.ngbModal.open(content, {
      windowClass: 'custom-field-modal'
    });
  }

  showReplyBox(comment) {
    this.showInputField = true;
    setTimeout(() => {
      if (!this.replyBox.ngMentionId) {
        this.showReplyBox(comment);
        return false;
      }
      this.replyBox.ngMentionId.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      this.replyBox.ngMentionId.nativeElement.focus();
      if (comment.anonymous == 0) {
        this.preMention = comment.user;
      }

      // this.ngMentionTriggers('@');
      // this.ngMentionTriggers(user.userName);
      // this.replyBox.ngMentionId.nativeElement.value += ' ';
    }, 200);
  }

  searchByTag(event) {
    this.router.navigateByUrl('/shared/search');
    return false;
  }

  removeTag(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }

  getAttachments() {
    const attachments = _.map(this.selectedFiles, (file) => {
      file.userAttachment = file.id;
      return file;
    });

    return attachments;
  }

  updateReply(reply, i) {
    this.thread[i] = reply;
    this.processComments();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  deleteMedia(file) {}
}
