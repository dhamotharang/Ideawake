import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppState, STATE_TYPES } from '../../../../store';
import { AddEditShortcutSearchComponent } from '../../../search/components/add-edit-shortcut-search/add-edit-shortcut-search.component';
import { SharedApi, NotificationService } from '../../../../services';
import { find, get, split, isEmpty, map, keyBy } from 'lodash';
@Component({
  selector: 'app-ideas-list-view-options',
  templateUrl: './ideas-list-view-options.component.html',
  styleUrls: ['./ideas-list-view-options.component.scss']
})
export class IdeasListViewOptionsComponent implements OnInit, OnDestroy {
  @Input() pageType = 'table';
  @Output() outputRes = new EventEmitter();
  private sub: Subscription;
  closeResult: string;
  viewsList = [];
  permissions = [];
  selectedView;
  deleteId;
  constructor(
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private modalService: NgbModal,
    private notificationService: NotificationService,
    private sharedApi: SharedApi,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.getViewsList();
    });
    this.subscribeForNewPosting();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  subscribeForNewPosting() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.formSubmitted)
      .subscribe((state: any) => {
        const isNewSubmission = get(state, 'latestSubmission.view', false);
        if (isNewSubmission) {
          this.getViewsList();
        }
      });
  }

  getViewsList(searchText?) {
    const params = {
      isDeleted: false,
      ...{ searchText }
    };
    this.sharedApi.getBookmarkedView(params).subscribe((res: any) => {
      this.viewsList = res.response;
      this.getPermission();
      this.selectAppliedView();
    });
  }

  selectAppliedView() {
    this.selectedView = find(this.viewsList, {
      bookmarkedUrl: this.router.url
    });
    this.selectedView = !this.selectedView ? {} : this.selectedView;
    this.outputRes.emit(this.selectedView);
    if (isEmpty(this.selectedView)) {
      const urlTree = split(this.router.url, '?');
      if (urlTree[0] === '/idea/table') {
        this.selectedView = { viewType: 'table', title: 'Submissions' };
      } else if (urlTree[0] === '/idea/cards') {
        this.selectedView = { viewType: 'card', title: 'Submissions' };
      }
    }
  }

  getPermission() {
    const payload = {
      bookmarkedViewIds: map(this.viewsList, 'id')
    };
    this.sharedApi.getBookmarkPermission(payload).subscribe((res: any) => {
      this.permissions = keyBy(res.response, 'bookmarkedViewId');
    });
  }

  hasPermission(id) {
    return get(this.permissions[id], 'manageBookmarkedView') === 0
      ? false
      : true;
  }

  deleteView() {
    this.sharedApi.deleteBookmarkedView(this.deleteId).subscribe((res: any) => {
      this.notificationService.showSuccess('View deleted successfully');
      this.getViewsList();
      this.modalService.dismissAll();
    });
  }

  edit(e, id) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const modalRef = this.modalService.open(AddEditShortcutSearchComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
    modalRef.componentInstance.pageType = this.pageType;
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.outputResult.subscribe((result) => {
      modalRef.close('cancel');
      if (result.updated) {
        this.getViewsList();
      }
    });
  }

  getIcon(view) {
    if (view === 'table') {
      return 'bars';
    } else if (view === 'card') {
      return 'th';
    } else {
      return 'bars';
    }
  }

  open(e, id, content) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.deleteId = id;
    this.modalService.open(content, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  navigateTo(bookmarkedUrl) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(bookmarkedUrl));
  }

  getTitle(obj, path, limit = 22) {
    let title = get(obj, path, null);
    if (title.length > limit) {
      title = title.substring(0, limit) + ` ...`;
    }
    return title;
  }
}
