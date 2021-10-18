import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges
} from '@angular/core';

import {
  NotificationService,
  SocialActivitiesApiService
} from '../../../../services';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit {
  @Input() data;
  @Input() entityType;
  @Input() inlineIcon = false;
  @Output() bookmarked = new EventEmitter<any>();

  currentUser;
  bookmarkText = '';

  constructor(
    private socialActivityApi: SocialActivitiesApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {}

  toggle(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!this.data.bookmark) {
      this.addToBookmarks();
    } else {
      this.removeFromBookmarks();
    }
  }

  addToBookmarks() {
    this.socialActivityApi
      .addToBookmarks({
        entityObjectId: this.data.id,
        entityType: this.entityType.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        displayName: this.data.title,
        email: this.ngRedux.getState().userState.user.email
      })
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.notifier.showSuccess('Alerts.BookmarkSuccess', {
            positionClass: 'toast-bottom-right'
          });
          this.data.bookmark = true;
          this.data.bookmarkId = res.response.id;
          this.bookmarked.emit(this.data);
        } else {
          this.notifier.showError('Something Went Wrong');
        }
      });
  }

  removeFromBookmarks() {
    this.socialActivityApi
      .removeFromBookmarks(this.data.bookmarkId)
      .subscribe((result: any) => {
        if (result.statusCode === 200) {
          this.notifier.showInfo('Alerts.BookmarkRemove', {
            positionClass: 'toast-bottom-right'
          });
          this.data.bookmark = false;
          this.data.bookmarkId = null;
          this.bookmarked.emit(this.data);
        } else {
          this.notifier.showError('Something Went Wrong');
        }
      });
  }
}
