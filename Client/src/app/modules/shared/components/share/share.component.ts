import { NgRedux } from '@angular-redux/store';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  EntityApiService,
  GroupsApiService,
  NotificationService,
  SharingApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { DEFAULT_PRELOADED_IMAGE, ENTITY_TYPE } from '../../../../utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  image = 'https://via.placeholder.com/40x40';
  @Input() ideaId;
  closeResult: string;
  ideaEntity;
  sharingMessage = '';
  sharedWith = [];
  currentUser: any;
  searchTerm = '';
  users = [];
  communityId: any;
  dataToSend = [];

  constructor(
    private ngRedux: NgRedux<AppState>,
    private modalService: NgbModal,
    private entityApiService: EntityApiService,
    private NotificationService: NotificationService,
    private sharingApiService: SharingApiService,
    private groupsApi: GroupsApiService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.ngRedux.getState().userState;
    this.communityId = this.currentUser.currentCommunityId;
    this.getEntity();
  }

  getSharings() {
    this.groupsApi
      .getUsersByCommunityId(this.communityId)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.users = res.response;
        }
      });
  }

  open(content) {
    this.getSharings();
    this.getEntity();
    this.sharingMessage = '';
    this.searchTerm = '';
    this.dataToSend = [];
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg'
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  getEntity() {
    this.ideaEntity = this.entityApiService.getEntity(ENTITY_TYPE.IDEA);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  searchUsers(val) {
    this.groupsApi
      .getUsersByCommunityId(
        this.currentUser.currentCommunityId,
        null,
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

  findUser(user) {
    return _.includes(this.dataToSend, user);
  }

  checkAllUsers() {
    return _.isEqual(this.dataToSend.sort(), this.users.sort());
  }

  saveSharing(event) {
    if (this.dataToSend.length) {
      this.sharingApiService
        .shareWithUser({
          entityObjectId: this.ideaId,
          entityType: this.ideaEntity.id,
          community: this.ngRedux.getState().userState.currentCommunityId,
          sharedWith: _.compact(_.map(this.dataToSend, 'id')),
          message: this.sharingMessage
        })
        .subscribe((result: any) => {
          this.NotificationService.showSuccess(
            `You have successfully shared this opportunity.`
          );
          event.close();
        });
    }
    if (!this.dataToSend.length) {
      this.NotificationService.showInfo(`No user selected!`);
    }
  }
}
