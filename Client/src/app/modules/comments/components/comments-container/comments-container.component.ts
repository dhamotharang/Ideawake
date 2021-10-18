import * as _ from 'lodash';

import { ActivatedRoute, Router } from '@angular/router';
import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  CommentApiService,
  NotificationService,
  SharedApi,
  UtilService,
  CommunityApi
} from '../../../../services';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  LOAD_ALL_FILES,
  LOAD_SELECTED_COMMENT_FILES
} from '../../../../actions';

import { DEFAULT_PRELOADED_IMAGE, ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss'],
  providers: [CommunityApi]
})
export class CommentsContainerComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Output() commentsCount = new EventEmitter<any>();
  @Input() comment;
  @Input() entityConfig;
  @Input() permissions;
  @Input() simpleComments = false;
  @Input() userOpportunityPermissions;
  @Input() queryParams: any = this.activatedRoute.snapshot.queryParams;
  isLoading;
  constructor(
    private modalService: NgbModal,
    private socket: Socket,
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    public util: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commentApiService: CommentApiService,
    private communityApi: CommunityApi,
    private notifier: NotificationService
  ) {}
  public tagsData: object = {};
  public mentionsData = [];
  public currentUser = this.ngRedux.getState().userState;
  closeResult: string;
  allComments;
  commentCounts = 0;
  commentUpvotes;
  allFiles = [];
  mentionUsers;
  mentionGroups;
  mentionTags;
  selectedFiles;
  modalRef;

  private sub: Subscription;

  ngOnInit() {
    this.isLoading = true;
    this.getMentionData();
    this.getTags();
    this.getStoredFiles();
    this.getCommentThread();

    this.socket
      .fromEvent(
        this.currentUser.currentCommunityId.toString() +
          this.entityConfig.entityObjectId
      )
      .subscribe((res: any) => {
        this.allComments = res.data;
        this.commentsCount.emit(this.allComments.length);
        this.tagsData = res.tagsData;
        this.mentionsData = res.mentionsData;
        this.commentCounts = res.commentCounts;
        this.selectedFiles = [];
        this.fetchMyCommentVotes();
        this.processComments();
        this.refreshFilesData(this.allComments);
      });
  }

  async fetchMyCommentVotes() {
    let allCommentIds = [];
    _.forEach(this.allComments, (comment) => {
      allCommentIds.push(_.get(comment, 'comment.id'));
      allCommentIds.push(
        _.map(_.get(comment, 'commentThreadPerticipants'), 'comment.id')
      );
    });
    allCommentIds = _.chain(allCommentIds).flatten().compact().value();

    const votesResp = await this.sharedApi
      .getMyEntitiesUpvotes({
        entityObjectIds: allCommentIds,
        entityTypeAbbr: ENTITY_TYPE.COMMENT
      })
      .toPromise();

    const votesByComment = _.keyBy(votesResp['response'], 'entityObjectId');

    _.forEach(this.allComments, (comment) => {
      // Checking my vote on parent comment.
      if (_.get(votesByComment, _.get(comment, 'comment.id'))) {
        comment.isUpvoted = true;
        comment.myVoteData = _.get(
          votesByComment,
          _.get(comment, 'comment.id')
        );
      } else {
        comment.isUpvoted = false;
      }

      // Checking my votes on replies.
      _.forEach(_.get(comment, 'commentThreadPerticipants'), (reply) => {
        if (_.get(votesByComment, _.get(reply, 'comment.id'))) {
          reply.isUpvoted = true;
          reply.myVoteData = _.get(votesByComment, _.get(reply, 'comment.id'));
        } else {
          reply.isUpvoted = false;
        }
      });
    });
  }

  processComments() {
    _.forEach(this.allComments, async (comment) => {
      comment.messageHtml = await this.util.processCommentMentions(
        comment.comment,
        this.mentionsData
      );
    });
  }

  scroll(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      el.classList.add('highlight');
      setTimeout(() => {
        el.classList.remove('highlight');
      }, 3000);
    }
  }

  getStoredFiles() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((filesData: Files) => {
        this.selectedFiles = filesData.commentFiles.selected;
        this.allFiles = filesData.all;
      });
  }

  getCommentThread() {
    this.commentApiService
      .getComments(this.entityConfig.entityObjectId)
      .subscribe((res: any) => {
        this.allComments = res.response.data;
        this.commentsCount.emit(this.allComments.length);
        this.commentUpvotes = res.response.upvotes;
        this.tagsData = res.response.tagsData;
        this.mentionsData = res.response.mentionsData;
        this.commentCounts = res.response.commentCounts;
        this.fetchMyCommentVotes();
        this.processComments();
        this.refreshFilesData(this.allComments);
        setTimeout(() => {
          if (this.queryParams.scrollTo) {
            this.scroll(this.queryParams.scrollTo);
          }
        }, 1000);
        this.isLoading = false;
      });
  }

  refreshFilesData(comments) {
    comments.forEach((comment) => {
      comment.comment.commentAttachments.forEach((file) => {
        this.selectedFiles = this.selectedFiles.concat(file.userAttachment);
      });
      comment.commentThreadPerticipants.forEach((reply) => {
        reply.comment.commentAttachments.forEach((file) => {
          this.selectedFiles = this.selectedFiles.concat(file.userAttachment);
        });
      });
    });
  }

  private getMentionData() {
    const params = {
      community: this.currentUser.currentCommunityId,
      opportunity: this.entityConfig.entityObjectId
    };
    this.communityApi.getMentionData(params).subscribe((res: any) => {
      this.mentionUsers = _.get(res.response, 'users', []);
      this.mentionGroups = _.get(res.response, 'groups', []);
    });
  }

  getTags() {
    this.sharedApi.searchTags().subscribe((res2: any) => {
      this.mentionTags = res2.response;
    });
  }

  open(content) {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'custom-field-modal'
      // size: 'lg'
    });
  }

  archiveComment(id) {
    this.commentApiService
      .editComment(id, { isDeleted: true })
      .subscribe((res) => {
        this.modalRef.close();
        this.notifier.showSuccess('Comment archived successfully.');
        this.getCommentThread();
      });
  }

  showReplyBox(replyBox) {
    replyBox.showInputField = true;
    setTimeout(() => {
      if (!replyBox.replyBox.ngMentionId) {
        this.showReplyBox(replyBox);
        return false;
      }
      replyBox.replyBox.ngMentionId.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      replyBox.replyBox.ngMentionId.nativeElement.focus();
    }, 500);
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

  updateComment(comment, i) {
    // this.allComments[i] = comment;
    this.getCommentThread();
    // this.ngOnInit();
  }

  isCommentOwner(comment) {
    return comment.user.id === this.ngRedux.getState().userState.user.id;
  }

  updateThread(event) {
    this.getCommentThread();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.ngRedux.dispatch({ type: LOAD_SELECTED_COMMENT_FILES, selected: [] });
    this.ngRedux.dispatch({ type: LOAD_ALL_FILES, all: [] });

    // Disconnecting comments socket listener.
    this.socket.removeListener(
      this.currentUser.currentCommunityId.toString() +
        this.entityConfig.entityObjectId
    );
  }
}
