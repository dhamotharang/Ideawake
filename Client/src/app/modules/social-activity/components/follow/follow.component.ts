import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NotificationService, SocialActivitiesApiService } from '../../../../services';
import { AppState } from '../../../../store';
import { ENTITY_TYPE, NotificationMessages } from '../../../../utils';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.scss']
})
export class FollowComponent implements OnInit {
  @Input() data;
  @Input() entityObject;
  @Input() showText = false;
  @Input() entity;

  @Output() followed = new EventEmitter<any>();

  currentUser;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private socialActivityApi: SocialActivitiesApiService
  ) {}

  ngOnInit() {
    this.currentUser = this.ngRedux.getState().userState;
  }

  toggle() {
    if (this.data.following) {
      this.unFollow();
    } else {
      this.follow();
    }
  }

  private unFollow() {
    this.socialActivityApi
      .removeFromFollowing(this.data.followId)
      .subscribe((result: any) => {
        if (result.statusCode === 200) {
          this.notifier.showInfo(NotificationMessages.REMOVED_FROM_FOLLOWING, {
            positionClass: 'toast-bottom-right'
          });
          this.data.following = false;
          this.data.followId = '';
          this.followed.emit(this.data);
        } else {
          this.notifier.showError(NotificationMessages.ERROR);
        }
      });
  }

  private follow() {
    if (
      this.entity === ENTITY_TYPE.USER &&
      this.ngRedux.getState().userState.user.id === this.data.id
    ) {
      this.notifier.showWarning(NotificationMessages.SELF_FOLLOWING, {
        positionClass: 'toast-bottom-center'
      });
      return;
    }

    const data = {
      community: this.currentUser.currentCommunityId,
      entityObjectId: this.entityObject.id,
      entityType: this.entityObject.typeId,
      displayName: this.data.title || this.data.name,
      entity: this.entityObject.entity
    };

    this.socialActivityApi.addToFollowing(data).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.notifier.showSuccess(NotificationMessages.ADDED_TO_FOLLOWING, {
          positionClass: 'toast-bottom-right'
        });
        this.data.following = true;
        this.data.followId = res.response.id;
        this.followed.emit(this.data);
      } else {
        this.notifier.showError(NotificationMessages.ERROR);
      }
    });
  }
}
