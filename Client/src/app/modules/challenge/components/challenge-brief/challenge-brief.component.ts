import { get, remove, map, last, split } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LOAD_SELECTED_CHALLENGE_FILES } from '../../../../actions';
import {
  ChallengesApiService,
  NotificationService,
  SharedApi
} from '../../../../services';
import { AppState, Files, STATE_TYPES } from '../../../../store';
import { ENTITY_FOLDER, DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { UploadContentComponent } from '../../../uploads/components';

@Component({
  selector: 'app-challenge-brief',
  templateUrl: './challenge-brief.component.html',
  styleUrls: ['./challenge-brief.component.scss']
})
export class ChallengeBriefComponent implements OnInit, OnChanges, OnDestroy {
  @Input() modal = false;
  @ViewChild('startDate', { static: false }) startDateElement;
  @ViewChild('endDate', { static: false }) endDateElement;
  @Input() challenge;
  @Output() switchTab = new EventEmitter<any>();
  @Output() data = new EventEmitter<any>();
  @Output() updateData = new EventEmitter<any>();
  defaultImage = DEFAULT_PRELOADED_IMAGE;

  public currentUser = this.ngRedux.getState().userState;
  public challengeId = this.activatedRoute.snapshot.params.id;
  public form: FormGroup;
  public tags: any;
  public outputData: any;
  public minDate: any;
  public attachments;
  public dedicatedTerms;

  s3Folders = ENTITY_FOLDER;

  private sub: Subscription;
  tinyMceConfig: any;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private challengesApiService: ChallengesApiService,
    private notifier: NotificationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private sharedApi: SharedApi,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.attachments = files.challengeFiles.selected;
        this.addNameInAttachments();
      });
  }

  ngOnInit() {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    if (this.modal) {
      this.initializeForm();
      this.sharedApi.searchTags().subscribe((res: any) => {
        this.tags = res.response;
      });
    }
    this.configureTinyMce();
  }

  ngOnChanges() {
    this.initializeForm();
    this.sharedApi.searchTags().subscribe((res: any) => {
      this.tags = res.response;
    });
  }

  configureTinyMce() {
    this.tinyMceConfig = {
      height: 500,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
      ],
      toolbar:
        'undo redo | formatselect | bold italic backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | addImage | help',
      setup: (editor) => {
        editor.ui.registry.addButton('addImage', {
          text: 'Add Image',
          icon: 'image',
          onAction: () => {
            const modalRef = this.modalService.open(UploadContentComponent, {
              size: 'lg'
            });
            modalRef.componentInstance.modalRef = modalRef;
            modalRef.componentInstance.from = 'challengeBrief';
            modalRef.componentInstance.isModal = true;

            modalRef.componentInstance.challengeBriefFile.subscribe((files) => {
              files.forEach((value) => {
                editor.insertContent(
                  '&nbsp; <img src="' + value.url + '" /> &nbsp;'
                );
              });
            });
          }
        });
      }
    };
  }

  addNameInAttachments() {
    if (get(this.attachments, 'length')) {
      this.attachments.forEach((value, index) => {
        this.attachments[index].name = last(split(value.url, '/')).replace(
          /^[0-9]+/,
          ''
        );
      });
    }
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      title: [this.challenge.title, Validators.required],
      description: [this.challenge.description, Validators.required],
      bannerImage: [this.challenge.bannerImage],
      tags: [this.challenge.tags],
      expiryStartDate: [moment().format('L')],
      expiryEndDate: [moment().add(1, 'M').format('L')],
      haveExpiry: [get(this.challenge, 'haveExpiry', false)],
      hasAdditionalBrief: [get(this.challenge, 'hasAdditionalBrief', false)],
      additionalBrief: [this.challenge.additionalBrief]
    });
    this.attachments = this.challenge.challengeAttachments;
    this.addNameInAttachments();
    if (get(this.challenge, 'haveExpiry', false)) {
      this.form.controls.expiryStartDate.setValue(
        moment(this.challenge.expiryStartDate).format('L')
      );
      this.form.controls.expiryEndDate.setValue(
        moment(this.challenge.expiryEndDate).format('L')
      );
      setTimeout(() => {
        const start = new Date(this.form.value.expiryStartDate);
        const end = new Date(this.form.value.expiryEndDate);
        this.startDateElement.navigateTo({
          year: moment(start).year(),
          month: moment(start).month() + 1,
          day: moment(start).date()
        });
        this.endDateElement.navigateTo({
          year: moment(end).year(),
          month: moment(end).month() + 1,
          day: moment(end).date()
        });
      }, 1000);
    }
  }

  openUploadComponent() {
    const modalRef = this.modalService.open(UploadContentComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.from = 'challenge';
    modalRef.componentInstance.isModal = true;
  }

  deleteMedia(i) {
    this.attachments = remove(this.attachments, (a, index) => index !== i);
    this.ngRedux.dispatch({
      type: LOAD_SELECTED_CHALLENGE_FILES,
      selected: this.attachments
    });
  }

  haveExpiryChange(event) {
    if (event.target.checked) {
      setTimeout(() => {
        const start = new Date(this.form.value.expiryStartDate);
        const end = new Date(this.form.value.expiryEndDate);
        this.startDateElement.navigateTo({
          year: moment(start).year(),
          month: moment(start).month() + 1,
          day: moment(start).date()
        });
        this.endDateElement.navigateTo({
          year: moment(end).year(),
          month: moment(end).month() + 1,
          day: moment(end).date()
        });
      }, 1000);
    }
  }

  changeTab(tabId) {
    const model = this.form.value;
    if (get(model, 'haveExpiry', false)) {
      model.expiryStartDate = new Date(this.form.value.expiryStartDate);
      model.expiryEndDate = new Date(this.form.value.expiryEndDate);
    } else {
      model.expiryStartDate = moment().format('L');
      model.expiryEndDate = moment().add(1, 'M').format('L');
    }
    this.data.emit(model);
    this.switchTab.emit({ tab: tabId });
  }

  tagSelected(event) {
    this.form.controls.tags.setValue(event);
  }

  removeBanner() {
    this.form.controls.bannerImage.setValue(null);
  }

  setFile(event) {
    this.form.controls.bannerImage.setValue(event);
  }

  onDateSelect(e, type) {
    const inputValue = e;
    inputValue.month = inputValue.month - 1;
    this.form.controls[type].setValue(moment(inputValue).format('L'));
  }

  saveDraft() {
    this.challenge.participants = this.challenge.challengeParticipant;
    this.challenge.draft = true;
    this.challengesApiService
      .postChallenge(this.challenge)
      .subscribe((res: any) => {
        this.notifier.showSuccess('Draft Added Successfully!');
        this.router.navigate(['/challenges/edit/', res.response.id]);
      });
  }

  close() {
    this.modalService.dismissAll();
  }

  updateDetails() {
    let data = {
      title: this.form.value.title,
      description: this.form.value.description,
      bannerImage: this.form.value.bannerImage,
      tags: this.form.value.tags,
      ...(this.form.value.haveExpiry
        ? {
            expiryStartDate: new Date(this.form.value.expiryStartDate),
            expiryEndDate: new Date(this.form.value.expiryEndDate)
          }
        : { expiryStartDate: null, expiryEndDate: null }),
      haveExpiry: this.form.value.haveExpiry,
      hasAdditionalBrief: this.form.value.hasAdditionalBrief,
      additionalBrief: this.form.value.additionalBrief,
      attachments: map(this.attachments, (obj) => {
        obj.isSelected = obj.isSelected ? 1 : 0;
        return obj;
      })
    };
    this.challengesApiService
      .updateChallenge(this.challenge.id, data)
      .subscribe(() => {
        this.notifier.showInfo('Updated Successfully!');
        this.updateData.emit(data);
        this.close();
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
