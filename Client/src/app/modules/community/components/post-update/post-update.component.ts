import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  ModalDismissReasons,
  NgbDatepicker,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { UploadContentComponent } from 'src/app/modules/uploads/components';
import {
  remove,
  cloneDeep,
  forEach,
  uniq,
  trimEnd,
  get,
  head,
  groupBy,
  map,
  trimStart,
  last,
  split,
  orderBy
} from 'lodash';
import { NgRedux } from '@angular-redux/store';
import { AppState, Files, STATE_TYPES, UpdateAudience } from 'src/app/store';
import {
  CLEAR_SELECTED_POST_UPDATE_FILES,
  LOAD_SELECTED_POST_UPDATE_FILES
} from 'src/app/actions';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import {
  EntityApiService,
  GroupsApiService,
  NotificationService,
  SharedApi,
  WorkflowApiService
} from 'src/app/services';
import { ActivatedRoute, Router } from '@angular/router';
import { ENTITY_TYPE } from 'src/app/utils/constants';

@Component({
  selector: 'app-post-update',
  templateUrl: './post-update.component.html',
  styleUrls: ['./post-update.component.scss']
})
export class PostUpdateComponent implements OnInit, OnDestroy {
  closeResult: string;
  private wasInside = false;
  audienceEditMode = false;
  public attachments;
  private subAttachments: Subscription;
  private subTargeting: Subscription;
  public minDate: any;
  currentDate;
  currentTime;
  targeting;
  backupTargeting;
  private allGroups = {};
  private allUsers = {};
  communityId;
  public postUpdateForm = this.formBuilder.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    scheduleDate: [null],
    scheduleTime: [null],
    sendEmail: [true],
    sendFeed: [true],
    allowCommenting: [false],
    allowVoting: [false]
  });
  @ViewChild('d', { static: false }) datepicker: NgbDatepicker;
  dateNow;
  stages;
  level = 'community';
  announcementId;
  announcement;
  totalTargetsCount;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    private notifier: NotificationService,
    private router: Router,
    private groupApi: GroupsApiService,
    private activatedRoute: ActivatedRoute,
    private entityApi: EntityApiService,
    private workflowApiService: WorkflowApiService
  ) {
    this.announcementId = this.activatedRoute.snapshot.params.announcementId;

    this.subAttachments = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.attachments = files.postUpdateFiles.selected;
        this.attachments.forEach((value, index) => {
          this.attachments[index].name = last(split(value.url, '/')).replace(
            /^[0-9]+/,
            ''
          );
        });
      });

    this.subTargeting = this.ngRedux
      .select(STATE_TYPES.UpdateAudienceState)
      .subscribe((targetingData: UpdateAudience) => {
        this.targeting = cloneDeep(targetingData.targeting);
        this.backupTargeting = cloneDeep(targetingData.targeting);
      });

    if (this.router.url.includes('community')) {
      this.level = 'community';
    } else if (this.router.url.includes('challenges')) {
      this.level = 'challenge';
    }
  }

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside) {
      this.targeting = cloneDeep(this.backupTargeting);
      this.audienceEditMode = false;
    }
    this.wasInside = false;
  }

  ngOnInit() {
    this.getStages();
    if (this.announcementId) {
      this.loadAnnouncement();
    }
    this.getCommunityGroups();
    this.getCommunityUsers();
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.dateNow = new Date();
    this.minDate = {
      year: moment(this.dateNow).year(),
      month: moment(this.dateNow).month() + 1,
      day: moment(this.dateNow).date()
    };
    this.currentDate = moment(this.dateNow).format('MM/DD/YYYY');
    this.currentTime = moment(this.dateNow).format('hh:mm A');
    this.getAnnouncementPotentialTargetsCount();
  }

  loadAnnouncement() {
    this.sharedApi.getAnnouncement(this.announcementId).subscribe(
      (res: any) => {
        this.announcement = res.response;
        this.postUpdateForm.controls.title.setValue(this.announcement.title);
        this.postUpdateForm.controls.message.setValue(
          this.announcement.message
        );
        this.postUpdateForm.controls.scheduleDate.setValue(
          moment(this.announcement.scheduledAt).format('MM/DD/YYYY')
        );
        this.postUpdateForm.controls.scheduleTime.setValue(
          moment(this.announcement.scheduledAt).format('hh:mm A')
        );
        this.postUpdateForm.controls.sendEmail.setValue(
          this.announcement.sendEmail
        );
        this.postUpdateForm.controls.sendFeed.setValue(
          this.announcement.sendFeed
        );
        this.postUpdateForm.controls.allowCommenting.setValue(
          this.announcement.experienceSetting.allowCommenting
        );
        this.postUpdateForm.controls.allowVoting.setValue(
          this.announcement.experienceSetting.allowVoting
        );
        this.targeting = cloneDeep(this.announcement.targeting);
        this.attachments = this.announcement.attachments;
        this.ngRedux.dispatch({
          type: LOAD_SELECTED_POST_UPDATE_FILES,
          selected: this.attachments
        });
        this.targeting.groups = [];
        this.announcement.targeting.groups.forEach((element) => {
          this.targeting.groups.push({ id: element, type: 'Group' });
        });
        this.targeting.individuals = [];
        this.announcement.targeting.individuals.forEach((element) => {
          this.targeting.individuals.push({ id: element, type: 'User' });
        });
        if (this.targeting.actionItemRelated.allOpenItemsStages) {
          this.targeting.actionItemRelated.openItemsStages.push(0);
        }
        if (this.targeting.actionItemRelated.allPastDueStages) {
          this.targeting.actionItemRelated.openPastDueStages.push(0);
        }

        if (this.targeting.actionItemRelated.openItemsStages.length > 0) {
          this.targeting.actionItemRelated.allOpenItemsStages = true;
        }
        if (this.targeting.actionItemRelated.openPastDueStages.length > 0) {
          this.targeting.actionItemRelated.allPastDueStages = true;
        }
        this.backupTargeting = cloneDeep(this.targeting);
        this.getAnnouncementPotentialTargetsCount();
      },
      (err) => {}
    );
  }

  openDatePicker() {
    if (
      this.postUpdateForm.value.scheduleDate == null &&
      this.postUpdateForm.value.scheduleTime == null
    ) {
      this.currentDate = moment(new Date()).format('MM/DD/YYYY');
      this.currentTime = moment(new Date()).format('hh:mm A');
      this.postUpdateForm.controls.scheduleDate.setValue(this.currentDate);
      this.postUpdateForm.controls.scheduleTime.setValue(this.currentTime);
    }
    this.datepicker.focusSelect();
  }

  open(content) {
    this.currentTime = moment(new Date()).format('hh:mm A');
    this.modalService
      .open(content, {
        windowClass: 'outcomes-modal',
        ariaLabelledBy: 'modal-basic-title',
        beforeDismiss: this.beforeDismiss
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

  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
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

  updateMessage(event) {
    this.postUpdateForm.controls.message.setValue(event);
  }

  openUploadComponent() {
    const modalRef = this.modalService.open(UploadContentComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.from = 'postUpdate';
    modalRef.componentInstance.isModal = true;
  }

  deleteMedia(i) {
    this.attachments = remove(this.attachments, (a, index) => index !== i);
    this.ngRedux.dispatch({
      type: LOAD_SELECTED_POST_UPDATE_FILES,
      selected: this.attachments
    });
  }

  onDateSelect(e, type) {
    const inputValue = e;
    inputValue.month = inputValue.month - 1;
    this.postUpdateForm.controls[type].setValue(moment(inputValue).format('L'));
  }

  updateAssigneeSettings(event) {
    this.targeting = event;
  }

  onClickButton(value) {
    if (value == 'Save') {
      this.backupTargeting = cloneDeep(this.targeting);
    } else if (value == 'Cancel') {
      this.targeting = cloneDeep(this.backupTargeting);
    }
    this.audienceEditMode = !this.audienceEditMode;
    this.getAnnouncementPotentialTargetsCount();
  }

  getCommunityGroups() {
    this.groupApi.getGroups().subscribe((res) => {
      const groupsRes = get(res, 'response.data');
      this.allGroups = groupBy(groupsRes, 'id');
    });
  }

  getCommunityUsers() {
    this.groupApi.getUsersByCommunityId(this.communityId).subscribe((res) => {
      const userRes = get(res, 'response');
      this.allUsers = groupBy(userRes, 'id');
    });
  }

  assigneeDetail() {
    let userString = '';
    const userArray = [];
    forEach(get(this.targeting, 'groups', []), (value) => {
      const group = head(this.allGroups[value.id]);
      if (group) {
        userArray.push(`${group.name}`);
      }
    });

    forEach(get(this.targeting, 'individuals', []), (value) => {
      const user = head(this.allUsers[value.id]);
      if (user) {
        userArray.push(`${user.firstName} ${user.lastName}`);
      }
    });

    if (this.stages) {
      if (this.targeting.actionItemRelated.allOpenItemsStages) {
        forEach(
          get(this.targeting, 'actionItemRelated.openItemsStages', []),
          (value) => {
            const allOpenItemsStages = head(this.stages[value]);
            if (allOpenItemsStages) {
              userArray.push(`${allOpenItemsStages.title}`);
            }
          }
        );
      }
      if (this.targeting.actionItemRelated.allPastDueStages) {
        forEach(
          get(this.targeting, 'actionItemRelated.openPastDueStages', []),
          (value) => {
            const openPastDueStages = head(this.stages[value]);
            if (openPastDueStages) {
              userArray.push(`${openPastDueStages.title}`);
            }
          }
        );
      }
    }

    if (this.targeting.allCommunityUsers) {
      userArray.push(`Community users`);
    }
    if (this.targeting.admins) {
      userArray.push(`Community Administrators`);
    }
    if (this.targeting.moderators) {
      userArray.push(`Community Moderators`);
    }
    if (this.targeting.challengeAdmins) {
      userArray.push(`Challenge Administrators`);
    }
    if (this.targeting.challengeModerators) {
      userArray.push(`Challenge Moderators`);
    }
    if (this.targeting.challengeParticipants) {
      userArray.push(`Challenge Participants`);
    }
    if (this.targeting.opportunityOwners) {
      userArray.push(`Idea Owners`);
    }
    if (this.targeting.opportunityTeam) {
      userArray.push(`Idea Team`);
    }
    if (this.targeting.opportunitySubmitters) {
      userArray.push(`Idea Submitters`);
    }

    forEach(uniq(userArray), (str) => {
      userString += `${str}, `;
    });
    userString = trimEnd(userString, ', ');
    let defaultStr = '';
    return userString ? `This update will target ${userString}` : defaultStr;
  }

  refineData() {
    remove(
      this.targeting.actionItemRelated.openItemsStages,
      (value) => value == 0
    );
    remove(
      this.targeting.actionItemRelated.openPastDueStages,
      (value) => value == 0
    );
    if (!this.targeting.actionItemRelated.allOpenItemsStages) {
      this.targeting.actionItemRelated.openItemsStages = [];
    }
    if (!this.targeting.actionItemRelated.allPastDueStages) {
      this.targeting.actionItemRelated.openPastDueStages = [];
    }

    if (this.targeting.actionItemRelated.openItemsStages.length > 0) {
      this.targeting.actionItemRelated.allOpenItemsStages = false;
    }
    if (this.targeting.actionItemRelated.openPastDueStages.length > 0) {
      this.targeting.actionItemRelated.allPastDueStages = false;
    }
    this.targeting.groups = map(this.targeting.groups, 'id');
    this.targeting.groups = this.targeting.groups.map((i) => Number(i));
    this.targeting.individuals = map(this.targeting.individuals, 'id');
    this.targeting.individuals = this.targeting.individuals.map((i) =>
      Number(i)
    );
  }

  getStages() {
    this.workflowApiService
      .getAllStages({ isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
        this.stages.push({
          id: 0,
          title: 'All Stages',
          workflowId: 0,
          orderNumber: 0
        });
        this.stages = orderBy(this.stages, ['orderNumber'], ['asc']);
        this.stages = groupBy(this.stages, 'id');
      });
  }

  getAnnouncementPotentialTargetsCount() {
    let targets = cloneDeep(this.targeting);
    remove(targets.actionItemRelated.openItemsStages, (value) => value == 0);
    remove(targets.actionItemRelated.openPastDueStages, (value) => value == 0);
    if (!targets.actionItemRelated.allOpenItemsStages) {
      targets.actionItemRelated.openItemsStages = [];
    }
    if (!targets.actionItemRelated.allPastDueStages) {
      targets.actionItemRelated.openPastDueStages = [];
    }

    if (targets.actionItemRelated.openItemsStages.length > 0) {
      targets.actionItemRelated.allOpenItemsStages = false;
    }
    if (targets.actionItemRelated.openPastDueStages.length > 0) {
      targets.actionItemRelated.allPastDueStages = false;
    }

    targets.groups = map(targets.groups, 'id');
    targets.groups = targets.groups.map((i) => Number(i));
    targets.individuals = map(targets.individuals, 'id');
    targets.individuals = targets.individuals.map((i) => Number(i));

    let entityObjectId = null;
    let entityType = null;
    if (this.level == 'challenge') {
      entityObjectId = Number(this.activatedRoute.snapshot.params.id);
      entityType = this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id;
    }
    let data = {
      entityObjectId: entityObjectId,
      entityType: entityType,
      targeting: targets
    };
    this.sharedApi.getAnouncementTargetsCount(data).subscribe((res: any) => {
      this.totalTargetsCount = res.response.totalTargetsCount;
    });
  }

  onSubmit(status) {
    if (this.postUpdateForm.invalid) {
      this.notifier.showError('fields with * are required');
      return;
    }

    if (
      this.postUpdateForm.value.scheduleDate == null ||
      this.postUpdateForm.value.scheduleTime == null
    ) {
      this.postUpdateForm.controls.scheduleDate.setValue(
        moment(new Date()).format('MM/DD/YYYY')
      );
      this.postUpdateForm.controls.scheduleTime.setValue(
        moment(new Date()).format('hh:mm A')
      );
    }

    if (
      !moment(
        this.postUpdateForm.value.scheduleDate,
        'MM/DD/YYYY',
        true
      ).isValid() ||
      !moment(this.postUpdateForm.value.scheduleTime, 'hh:mm A', true).isValid()
    ) {
      this.notifier.showError('Date or Time format is invalid');
      return;
    }
    let dateTime = moment(
      this.postUpdateForm.value.scheduleDate +
        ' ' +
        this.postUpdateForm.value.scheduleTime,
      'MM/DD/YYYY hh:mm A'
    );

    this.refineData();
    let entityObjectId = null;
    let entityType = null;
    if (this.level == 'challenge') {
      entityObjectId = Number(this.activatedRoute.snapshot.params.id);
      entityType = this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id;
    }

    let data = {
      title: this.postUpdateForm.value.title,
      message: this.postUpdateForm.value.message,
      status: status,
      scheduledAt: dateTime.toISOString(),
      sendEmail: this.postUpdateForm.value.sendEmail,
      sendFeed: this.postUpdateForm.value.sendFeed,
      entityObjectId: entityObjectId,
      entityType: entityType,
      targeting: this.targeting,
      experienceSetting: {
        allowCommenting: this.postUpdateForm.value.allowCommenting,
        allowVoting: this.postUpdateForm.value.allowVoting
      },
      attachments: this.attachments
    };
    if (!this.announcement) {
      this.sharedApi.addAnnouncement(data).subscribe(
        (res: any) => {
          let message = 'Announcement created successfully';
          if (status == 'draft') {
            message = 'Announcement draft created successfully';
          }
          this.notifier.showSuccess(message);
          if (this.level == 'community') {
            this.router.navigateByUrl('/');
          } else if (this.level == 'challenge') {
            this.router.navigate(['/challenges/view/', entityObjectId]);
          }
        },
        (err) => {
          this.notifier.showError('Something Went Wrong');
        }
      );
    } else {
      this.sharedApi.patchAnnouncement(this.announcementId, data).subscribe(
        (res: any) => {
          let message = 'Announcement updated successfully';
          if (status == 'draft') {
            message = 'Announcement draft updated successfully';
          }
          this.notifier.showSuccess(message);
          if (this.level == 'community') {
            this.router.navigateByUrl('/');
          } else if (this.level == 'challenge') {
            this.router.navigate(['/challenges/updates/', entityObjectId]);
          }
        },
        (err) => {
          this.notifier.showError('Something Went Wrong');
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.subAttachments) {
      this.ngRedux.dispatch({
        type: CLEAR_SELECTED_POST_UPDATE_FILES,
        selected: []
      });
      this.subAttachments.unsubscribe();
    }
    if (this.subTargeting) {
      this.subTargeting.unsubscribe();
    }
  }
}
