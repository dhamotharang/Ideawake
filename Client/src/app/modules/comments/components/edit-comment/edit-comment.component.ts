import * as _ from 'lodash';

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AppState, Files, STATE_TYPES } from '../../../../store';

import { CommentApiService } from '../../../../services';
import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { LOAD_SELECTED_COMMENT_FILES } from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.scss']
})
export class EditCommentComponent implements OnInit, AfterViewInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() comment;
  @Input() close;
  @Input() mentionGroups;
  @Input() mentionUsers;
  @Input() mentionTags;
  @Input() entityConfig;
  @Input() permissions;

  @Output() update = new EventEmitter<any>();

  mentions;
  selectedFiles;
  allFiles;
  tags;
  messageBody;

  @ViewChild('ngMentionId', { static: false }) ngMentionId;
  anonymous;
  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private commentApiService: CommentApiService
  ) {}

  ngOnInit() {
    this.mentions = this.comment.comment.mentions;
    this.tags = this.comment.comment.tags;
    this.messageBody = this.comment.comment.message;

    const files = [];
    this.comment.comment.commentAttachments.forEach((file) => {
      files.push(file.userAttachment);
    });

    this.ngRedux.dispatch({
      type: LOAD_SELECTED_COMMENT_FILES,
      selected: files
    });

    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((filesData: Files) => {
        this.selectedFiles = filesData.commentFiles.selected;
      });
  }

  ngAfterViewInit() {
    this.ngMentionId.ngMentionId.nativeElement.addEventListener(
      'focusout',
      (e) => {
        e.stopPropagation();
        setTimeout(() => this.expandArea(3), 100);
      }
    );

    this.ngMentionId.ngMentionId.nativeElement.addEventListener('focusin', () =>
      this.expandArea(5)
    );
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

  selectedMentions(id) {
    this.mentions.push(id);
  }

  selectedTags(id) {
    this.tags.push(id);
  }

  setComment(comment) {
    this.messageBody = comment;
  }

  expandArea(rows) {
    this.ngMentionId.rows = rows;
  }

  editComment() {
    setTimeout(() => this.close(), 2000);
    const data = {
      anonymous: this.anonymous ? 1 : 0,
      tags: this.tags,
      mentions: this.mentions,
      attachments: this.getAttachments(),
      message: this.messageBody
    };

    this.commentApiService
      .editComment(this.comment.comment.id, data)
      .subscribe((res) => {
        this.updateComment(data);
        this.close();
      });
  }

  getAttachments() {
    const attachments = _.map(this.selectedFiles, (file) => {
      file.userAttachment = file.id;
      return file;
    });

    return attachments;
  }

  deleteMedia(fileObject) {
    const foundIndex = _.findIndex(this.selectedFiles, (o) => {
      return o.url === fileObject.url;
    });
    if (foundIndex !== -1) {
      this.selectedFiles.splice(foundIndex, 1);
      this.ngRedux.dispatch({
        type: LOAD_SELECTED_COMMENT_FILES,
        selected: this.selectedFiles
      });
    }
  }

  updateComment(newComment) {
    this.comment.comment.message = newComment.message;
    this.comment.comment.tags = newComment.tags;
    this.comment.comment.mentions = newComment.mentions;
    this.comment.comment.commentAttachments = newComment.attachments;
    this.comment.comment.anonymous = newComment.anonymous;
    this.update.emit(this.comment);
  }

  ngOnDestroy() {
    this.ngRedux.dispatch({
      type: LOAD_SELECTED_COMMENT_FILES,
      selected: []
    });
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
