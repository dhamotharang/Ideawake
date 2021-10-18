import { get, map, cloneDeep } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';

import {
  ChallengesApiService,
  NotificationService,
  SharedApi
} from '../../../../services';
import { AppState } from '../../../../store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-challenge-audience',
  templateUrl: './challenge-audience.component.html',
  styleUrls: ['./challenge-audience.component.scss']
})
export class ChallengeAudienceComponent implements OnInit, OnChanges {
  @Input() modal = false;
  @Input() challenge;
  @Output() switchTab = new EventEmitter<any>();
  @Output() data = new EventEmitter<any>();
  @Output() updateData = new EventEmitter<any>();

  public currentUser = this.ngRedux.getState().userState;
  public outputData: any;
  public participants = [];
  public moderators = [];
  public sponsors = [this.currentUser.user.id];
  public participantsCount = 0;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    private modalService: NgbModal,
    private challengeApi: ChallengesApiService,
    private notifier: NotificationService
  ) {}

  async ngOnInit() {
    if (this.modal) {
      this.initializeData();
    }
  }

  async ngOnChanges() {
    this.initializeData();
    this.data.emit(this.outputData);
  }

  async initializeData() {
    this.populateData();
    this.participantsCount = get(
      await this.getAudienceCount([], [], true),
      'response.count',
      0
    );
  }

  populateData() {
    if (this.challenge) {
      const participantUsers = [];
      const participantGroups = [];
      this.participants = map(
        get(this.challenge, 'challengeParticipant', []),
        (value) => {
          if (value.type === 'Group') {
            participantGroups.push(value.participantId);
          } else {
            participantUsers.push(value.participantId);
          }
          return {
            id: value.participantId,
            type: value.type
          };
        }
      );
      this.moderators = get(this.challenge, 'moderators', []);
      this.sponsors = get(this.challenge, 'sponsors', [
        this.currentUser.user.id
      ]);
      this.outputData = {
        challengeParticipant: this.participants,
        moderators: this.moderators,
        sponsors: this.sponsors
      };
    }
  }

  changeTab(tabId) {
    this.switchTab.emit({ tab: tabId });
    this.data.emit(this.outputData);
  }

  async getParticipants(data) {
    const groups = [];
    const users = [];
    this.outputData.challengeParticipant = map(data, (value) => {
      if (value.type === 'Group') {
        groups.push(value.id);
      } else {
        users.push(value.id);
      }
      return {
        participantId: value.id,
        type: value.type
      };
    });
    this.data.emit(this.outputData);

    let allCommunityMembers = false;
    if (users.length == 0 && groups.length == 0) {
      allCommunityMembers = true;
    }
    this.participantsCount = get(
      await this.getAudienceCount(users, groups, allCommunityMembers),
      'response.count',
      0
    );
  }

  async getSponsors(data) {
    this.outputData.sponsors = data;
    this.data.emit(this.outputData);

    /*     this.sponsorsCount = get(
      await this.getAudienceCount(data),
      'response.count',
      0
    ); */
  }

  async getModerators(data) {
    this.outputData.moderators = data;
    this.data.emit(this.outputData);

    /*     this.moderatorsCount = get(
      await this.getAudienceCount(data),
      'response.count',
      0
    ); */
  }

  getAudienceCount(users, groups = [], allCommunityMembers = false) {
    return this.sharedApi
      .getUniqueUserCounts({
        users,
        groups,
        community: this.currentUser.currentCommunityId,
        allCommunityMembers
      })
      .toPromise();
  }

  close() {
    this.modalService.dismissAll();
  }

  updateAudience() {
    const tempData = cloneDeep(this.challenge);
    tempData.opportunityType = tempData.opportunityType.id;
    tempData.participants = this.outputData.challengeParticipant;
    tempData.moderators = this.outputData.moderators;
    tempData.sponsors = this.outputData.sponsors;
    tempData.workflow = this.challenge.workflowId || undefined;
    this.challengeApi
      .updateChallenge(this.challenge.id, tempData)
      .subscribe(() => {
        this.notifier.showInfo('Updated Successfully!');
        this.updateData.emit(tempData);
        this.close();
      });
  }
}
