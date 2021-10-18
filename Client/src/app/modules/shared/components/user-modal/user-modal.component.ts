import * as _ from 'lodash';

import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';

import { AppState } from '../../../../store';
import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss'],
  providers: [GroupsApiService]
})
export class UserModalComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  image = 'https://via.placeholder.com/40x40';
  @Input() users;
  @Input() close;
  @Input() dismiss;
  @Input() groupId;
  @Input() successfulImplementation: BehaviorSubject<boolean>;

  dataToSend = [];
  searchTerm = '';
  currentUser;

  private sub1: Subscription;
  private sub2: Subscription;

  constructor(
    private groupsApi: GroupsApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>,
    private ngbModal: NgbModal,
    private shareService: ShareDataService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.ngRedux.getState().userState;
    if (this.groupId) {
      this.searchUsers(this.searchTerm);
    }
  }

  clicked(user) {
    const removed = _.remove(this.dataToSend, (n) => n.id === user.id);
    if (removed.length === 0) {
      this.dataToSend.push(user);
    }
  }

  addAllUsers() {
    if (this.checkAllUsers()) {
      this.dataToSend = [];
    } else {
      this.dataToSend = [];
      _.forEach(this.users, (element) => {
        this.dataToSend.push(element);
      });
    }
  }

  searchUsers(val) {
    this.groupsApi
      .getUsersByCommunityId(
        this.currentUser.currentCommunityId,
        this.groupId,
        _.toLower(val)
      )
      .subscribe((res: any) => {
        this.users = [];
        this.dataToSend.forEach((element) => {
          this.users.push(element);
        });

        res.response.forEach((element) => {
          if (!_.find(this.users, { id: element.id })) {
            this.users.push(element);
          }
        });
        this.changeDetectorRef.detectChanges();
      });
  }

  addUsersToGroup() {
    const users = [];
    const flagVar = [...this.shareService.rowsToPrint];
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );

    _.forEach(this.dataToSend, (element) => {
      users.push({
        userId: element.id,
        circleId: this.groupId,
        role: 'User'
      });
    });

    this.groupsApi.addUsersToGroup(users).subscribe((res: any) => {
      _.forEach(flagVar, (elem) => {
        this.shareService.pushRowsToPrint(elem);
      });
      _.forEach(this.dataToSend, (elem) => {
        this.shareService.pushRowsToPrint({
          groupId: this.groupId,
          id: elem.id,
          name: `${elem.firstName} ${elem.lastName}`,
          email: elem.email,
          username: elem.userName,
          status: elem.isDeleted ? 'Archived' : 'Active'
        });
      });

      if (res.statusCode === 200) {
        this.notifier.showSuccess('Alerts.UsersAdded');
        this.successfulImplementation &&
          this.successfulImplementation.next(true);
      } else {
        this.notifier.showError('Something went wrong');
      }
    });

    this.ngbModal.dismissAll();
  }

  closeModal() {
    this.ngbModal.dismissAll();
  }

  ngOnDestroy() {
    if (this.sub1) {
      this.sub1.unsubscribe();
    }

    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }

  findUser(user) {
    return _.includes(this.dataToSend, user);
  }

  checkAllUsers() {
    return _.isEqual(this.dataToSend.sort(), this.users.sort());
  }
}
