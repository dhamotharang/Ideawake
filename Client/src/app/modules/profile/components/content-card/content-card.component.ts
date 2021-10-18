import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import {
  NotificationService,
  SocialActivitiesApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { NotificationMessages } from '../../../../utils';
import {
  CONTENT_CARD_TYPE,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils/constants';

@Component({
  selector: 'app-content-card',
  templateUrl: './content-card.component.html'
})
export class ContentCardComponent implements OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() dataSet;
  @Input() entities;
  @Input() tagsData;
  @Input() type = CONTENT_CARD_TYPE.OPPORTUNITY;
  @Output() unFollowed = new EventEmitter<any>();
  public queryParams = {};
  public currentUser = null;
  public addedTags = [];
  public redirectUrl = '#';
  public userRole = '';
  public cardType = CONTENT_CARD_TYPE;
  public defaultOpportunityImage =
    'https://ideawake-test.s3.us-east-2.amazonaws.com/assets/media/DefaultOppo.png';
  public image = this.defaultOpportunityImage;
  constructor(
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private socialActivityApi: SocialActivitiesApiService
  ) {}
  ngOnChanges() {
    this.currentUser = this.ngRedux.getState().userState;
    this.addedTags =
      this.type === CONTENT_CARD_TYPE.OPPORTUNITY
        ? _.get(this.dataSet, 'tags', [])
        : _.get(this.dataSet, 'skills', []);
    this.getRedirectUrl();
    this.getImageUrl();
    if (this.type === CONTENT_CARD_TYPE.USER) {
      this.userRole = _.get(
        _.find(_.get(this.dataSet, 'userCommunities', []), [
          'communityId',
          this.currentUser.currentCommunityId
        ]),
        'role',
        ''
      );
    }
  }
  getRedirectUrl() {
    if (this.type === CONTENT_CARD_TYPE.OPPORTUNITY) {
      this.redirectUrl = `/idea/view/${this.dataSet.id}`;
    } else if (this.type === CONTENT_CARD_TYPE.USER) {
      this.redirectUrl = `/profile/view/${this.dataSet.id}`;
      this.queryParams = { tab: 'summary' };
    }
  }
  getImageUrl() {
    if (this.type === CONTENT_CARD_TYPE.OPPORTUNITY) {
      if (!_.isEmpty(this.dataSet.opportunityAttachments)) {
        const lastImage = _.last(this.dataSet.opportunityAttachments);
        this.image = _.get(
          lastImage,
          'userAttachment.url',
          this.defaultOpportunityImage
        );
      }
    } else if (this.type === CONTENT_CARD_TYPE.USER) {
      this.image = _.get(this.dataSet, 'profileImage.url');
    }
  }
  toggle(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (this.dataSet.following) {
      this.unFollow();
    } else {
      this.follow();
    }
  }

  private unFollow() {
    this.socialActivityApi
      .removeFromFollowing(this.dataSet.followId)
      .subscribe((result: any) => {
        if (result.statusCode === 200) {
          this.notifier.showInfo(NotificationMessages.REMOVED_FROM_FOLLOWING);
          this.dataSet.following = false;
          this.dataSet.followId = '';
          this.unFollowed.emit(true);
        } else {
          this.notifier.showError(NotificationMessages.ERROR);
        }
      });
  }

  private follow() {
    let data = {};
    if (this.type === this.cardType.USER) {
      if (this.ngRedux.getState().userState.user.id === this.dataSet.id) {
        this.notifier.showWarning(NotificationMessages.SELF_FOLLOWING);
        return;
      }
      data = {
        entityObjectId: this.dataSet.id,
        community: this.currentUser.currentCommunityId,
        entityType: _.find(this.entities, ['entityCode', this.cardType.USER])
          .id,
        entity: this.cardType.USER,
        displayName: this.dataSet.firstName + ' ' + this.dataSet.lastName
      };
    } else if (this.type === this.cardType.OPPORTUNITY) {
      data = {
        entityObjectId: this.dataSet.id,
        community: this.currentUser.currentCommunityId,
        displayName: this.dataSet.opportunityType.name,
        entityType: _.find(this.entities, [
          'entityCode',
          this.dataSet.opportunityType.abbreviation
        ]).id,
        entity: this.dataSet.opportunityType.abbreviation
      };
    }
    this.socialActivityApi.addToFollowing(data).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.notifier.showSuccess(NotificationMessages.ADDED_TO_FOLLOWING);
        this.dataSet.following = true;
        this.dataSet.followId = res.response.id;
      } else {
        this.notifier.showError(NotificationMessages.ERROR);
      }
    });
  }
}
