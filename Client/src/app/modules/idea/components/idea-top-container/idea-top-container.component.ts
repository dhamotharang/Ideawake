import { DOCUMENT } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';
import {
  EntityApiService,
  WorkflowApiService,
  ApiService,
  NotificationService
} from '../../../../services';
import {
  ACTION_ITEM_ABBREVIATIONS,
  IDEA_TABS,
  ENTITY_TYPE
} from '../../../../utils';
import { get, first, nth, filter } from 'lodash';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-idea-top-container',
  templateUrl: './idea-top-container.component.html',
  styleUrls: ['./idea-top-container.component.scss']
})
export class IdeaTopContainerComponent implements OnInit, OnChanges {
  @Input() idea;
  @Input() isModel = false;
  @Input() followerData;
  @Input() commentCount = {};
  @Input() voteCount;
  @Input() upvoteData;
  @Input() topScore = {};
  @Input() tab = IDEA_TABS.summary.key;
  @Input() userOpportunityPermissions;
  @Input() permissions;
  @Input() ideaUpvoters;

  @Output() updateIdea = new EventEmitter<any>();
  @Output() archive = new EventEmitter<any>();
  @Output() switchTab = new EventEmitter<any>();

  // private stageEntity;
  public entityType;
  public entity = ENTITY_TYPE.IDEA;
  public upvotes;
  public currentStage;
  public actionItemAbbr = ACTION_ITEM_ABBREVIATIONS;
  public tabs = IDEA_TABS;
  public objectKeys = Object.keys;
  public queryParams: any = this.activatedRoute.snapshot.queryParams;

  constructor(
    @Inject(DOCUMENT) document,
    private ngbModal: NgbModal,
    private modalService: NgbModal,
    private workflowApi: WorkflowApiService,
    private router: Router,
    private entityApi: EntityApiService,
    private activatedRoute: ActivatedRoute,
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    this.getIdeaEntity();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    if (window.pageYOffset > 150) {
      const element = document.getElementById('navbar');
      element.classList.remove('hide-navigation');
      element.classList.add('topCallout');
    } else {
      const element = document.getElementById('navbar');
      element.classList.remove('topCallout');
      element.classList.add('hide-navigation');
    }
  }

  ngOnChanges() {
    if (this.idea && this.idea.stage) {
      this.workflowApi
        .getStageById(this.idea.stage.id)
        .subscribe((res: any) => {
          this.currentStage = res.response;
        });
    }
  }

  private getIdeaEntity() {
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  update(idea) {
    this.updateIdea.emit(idea);
    this.navigateTo({ tab: this.tabs.summary.key });
  }

  navigateTo(params) {
    this.tab = params.tab;
    this.switchTab.emit(this.tab);
  }

  close() {
    setTimeout(() => {
      this.router.navigateByUrl(`/idea/view/${this.idea.id}`);
    }, 100);
    this.modalService.dismissAll();
  }

  closeModal() {
    this.ngbModal.dismissAll();
  }

  archiveIdea() {
    this.archive.emit();
  }

  viewStageSpecificTab(key) {
    if (
      (key === this.tabs.moreInfo.key &&
        get(this.idea, 'stage.actionItem.abbreviation') ===
          this.actionItemAbbr.REFINEMENT) ||
      (key === this.tabs.questions.key &&
        get(this.idea, 'stage.actionItem.abbreviation') ===
          this.actionItemAbbr.SCORECARD)
    ) {
      return get(this.userOpportunityPermissions, 'viewStageSpecificTab', 0) > 0
        ? true
        : false;
    } else {
      return false;
    }
  }
  bookmarkIdea() {
    const currentUserId = this.ngRedux.getState().userState.user.id;
    if (this.idea.bookmark) {
      this.apiService
        .delete(
          `/bookmark/user/${currentUserId}/bookmark/${this.idea.bookmarkId}`
        )
        .subscribe((result: any) => {
          if (result.statusCode === 200) {
            this.idea.bookmarkId = '';
            this.idea.bookmark = false;
            this.notifier.showInfo('Alerts.BookmarkRemove', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showError('Something Went Wrong');
          }
        });
    } else {
      this.apiService
        .post('/bookmark', {
          community: this.ngRedux.getState().userState.currentCommunityId,
          entityType: this.entityType.id,
          entityObjectId: this.idea.id,
          displayName: this.idea.title,
          url: `/idea/view/${this.idea.id}`,
          email: 'idea@idea.com',
          entity: 'idea'
        })
        .subscribe((res: any) => {
          this.idea.bookmarkId = res.response.id;
          if (res.statusCode === 200) {
            this.idea.bookmark = true;
            this.notifier.showSuccess('Alerts.BookmarkSuccess', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showError('Something Went Wrong');
          }
        });
    }
  }

  renderIdeaUpvoters(ideaUpvoters) {
    let str = '';
    if (ideaUpvoters) {
      const firstVoter = first(ideaUpvoters);
      if (firstVoter) {
        str += firstVoter.user.firstName + ' ' + firstVoter.user.lastName;
        if (ideaUpvoters.length === 2) {
          str += ' and ';
        } else {
          str += ', ';
        }

        const secondVoter = nth(ideaUpvoters, 1);
        if (secondVoter) {
          str += secondVoter.user.firstName + ' ' + secondVoter.user.lastName;
          if (ideaUpvoters.length === 3) {
            str += ' and ';
          } else {
            str += ', ';
          }

          const thirdVoter = nth(ideaUpvoters, 2);
          if (thirdVoter) {
            str += thirdVoter.user.firstName + ' ' + thirdVoter.user.lastName;
          }
          if (ideaUpvoters.length > 3) {
            const remaining = ideaUpvoters.length - 3;
            str +=
              ' and ' + remaining + ' other' + (remaining === 1 ? '' : 's');
          }
        }
      }
    }
    return str;
  }

  removeUpvoter(data) {
    if (data.type === 'add') {
      this.ideaUpvoters = this.ideaUpvoters || [];
      this.ideaUpvoters.push(data.data);
      this.ideaUpvoters = [...this.ideaUpvoters];
    } else {
      this.ideaUpvoters = filter(this.ideaUpvoters, [
        'user.id',
        data.data.user.id
      ]);
    }
  }
}
