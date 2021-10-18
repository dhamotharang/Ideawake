import * as _ from 'lodash';
import * as momentTZ from 'moment-timezone';

import { NgRedux } from '@angular-redux/store';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  EmailTemplateApiService,
  NotificationService
} from '../../../../services';
import { AppState } from '../../../../store';
import {
  EMAIL_TEMPLATE_TABS,
  ENTITY_FOLDER,
  EMAIL_TEMPLATE_TYPES,
  DEFAULT_PRELOADED_IMAGE,
  EMAIL_BOOKMARKS
} from '../../../../utils';
import { TemplatePreviewComponent } from '../template-preview/template-preview.component';

@Component({
  selector: 'app-community-manage-emails-container',
  templateUrl: './community-manage-emails-container.component.html',
  styleUrls: ['./community-manage-emails-container.component.scss']
})
export class CommunityManageEmailsContainerComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  public currentUser = this.ngRedux.getState().userState;
  @ViewChild('emailBodyText', { static: false })
  emailBodyTextElement: ElementRef;
  @ViewChild('emailSubject', { static: false })
  emailSubjectElement: ElementRef;
  public timeZonesList = momentTZ.tz.names();
  public templateForm: FormGroup;
  public tabs = EMAIL_TEMPLATE_TABS;
  public templateTypes = EMAIL_TEMPLATE_TYPES;
  public tab = EMAIL_TEMPLATE_TABS.emailBody.key;
  public selectedTemplate;
  public objectKeys = Object.keys;
  public edit = false;
  public schedule = false;
  public emailBody = '';
  public templates = [];
  public isEnabled;
  public s3Folder = ENTITY_FOLDER;
  public bookMarks = EMAIL_BOOKMARKS.default;
  constructor(
    private emailTemplateApiService: EmailTemplateApiService,
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getAllTemplates();
    this.timeZonesList = _.map(this.timeZonesList, (value) => {
      return { id: value, name: value };
    });
    this.initializeForm({});
  }

  getAllTemplates() {
    this.emailTemplateApiService
      .getEmailTemplatesCommunityWise({
        community: this.currentUser.currentCommunityId
      })
      .subscribe((res: any) => {
        this.templates = res.response;
      });
  }

  addBookMark(bookmark = '', type) {
    let element;
    if (type === 'subject') {
      element = this.emailSubjectElement.nativeElement;
    } else if (type === 'body') {
      element = this.emailBodyTextElement.nativeElement;
    }
    const startPos = element.selectionStart;
    element.value =
      element.value.substr(0, element.selectionStart) +
      bookmark +
      element.value.substr(element.selectionStart, element.value.length);
    element.selectionEnd = startPos + bookmark.length;
    element.focus();
    if (type === 'subject') {
      this.templateForm.controls.subject.setValue(element.value);
    }
  }

  initializeForm(template) {
    this.templateForm = this.fb.group({
      name: [template.name, Validators.required],
      senderName: [template.senderName, Validators.required],
      senderEmail: [template.senderEmail, Validators.required],
      isDeleted: [template.isDeleted],
      frequency: [template.frequency],
      runAt: [template.runAt],
      timeZone: [template.timeZone],
      featureImage: [template.featureImage, Validators.required],
      subject: [template.subject, Validators.required],
      body: [template.body, Validators.required],
      footerSection: [template.footerSection, Validators.required]
    });
    if (
      template.name !== EMAIL_TEMPLATE_TYPES.INVITE_USER &&
      template.name !== EMAIL_TEMPLATE_TYPES.FORGOT_PASSWORD &&
      template.name !== EMAIL_TEMPLATE_TYPES.UPDATES
    ) {
      this.schedule = true;
      this.templateForm.controls.frequency.setValidators([Validators.required]);
      this.templateForm.controls.timeZone.setValidators([Validators.required]);
    } else {
      this.schedule = false;
    }
  }

  setEmailBody(event) {
    this.templateForm.controls.body.setValue(event);
  }

  setEmailFooter(event) {
    this.templateForm.controls.footerSection.setValue(event);
  }

  editTemplate(template) {
    this.initializeForm(template);
    this.selectedTemplate = template;
    this.edit = true;
    this.isEnabled = template.isDeleted ? false : true;
    if (template.name === EMAIL_TEMPLATE_TYPES.ADD_WORKFLOW_TO_AN_OPPORTUNITY) {
      this.bookMarks = EMAIL_BOOKMARKS.addWorkflow;
    } else if (
      template.name === EMAIL_TEMPLATE_TYPES.CHANGE_WORKFLOW_OF_AN_OPPORTUNITY
    ) {
      this.bookMarks = EMAIL_BOOKMARKS.changeWorkflow;
    } else if (
      template.name === EMAIL_TEMPLATE_TYPES.CHANGE_STAGE_OF_AN_OPPORTUNITY
    ) {
      this.bookMarks = EMAIL_BOOKMARKS.changeStage;
    } else if (template.name === EMAIL_TEMPLATE_TYPES.UPDATES) {
      this.bookMarks = EMAIL_BOOKMARKS.updates;
    } else {
      this.bookMarks = EMAIL_BOOKMARKS.default;
    }
  }

  closeTemplate() {
    this.edit = false;
  }

  onSubmit() {
    this.templateForm.value.frequency = parseInt(
      this.templateForm.value.frequency,
      10
    );
    this.templateForm.value.isDeleted = !this.isEnabled;
    this.emailTemplateApiService
      .updateEmailTemplate(
        this.selectedTemplate.id,
        this.currentUser.currentCommunityId,
        this.templateForm.value
      )
      .subscribe((res: any) => {
        this.getAllTemplates();
        this.edit = false;
        this.notifier.showSuccess('Email Template Updated Successfully!');
      });
  }

  testEmailContent() {
    this.emailTemplateApiService
      .testEmail(this.templateForm.value)
      .subscribe((res: any) => {
        this.notifier.showSuccess(
          'Email Sent Successfully! Please check your email.'
        );
      });
  }

  openPreviewModal() {
    const modalRef = this.modalService.open(TemplatePreviewComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.title = 'Email Template Preview';
    modalRef.componentInstance.featureImage = this.templateForm.value.featureImage;
    modalRef.componentInstance.body = this.templateForm.value.body;
    modalRef.componentInstance.footer = this.templateForm.value.footerSection;
    modalRef.componentInstance.subject = this.templateForm.value.subject;
  }

  utcToTimeZone(date, timeZone) {
    return momentTZ.tz(date, timeZone);
  }

  checkIsValid(type) {
    return this.templateForm.controls[type].valid;
  }

  subjectBookmarks() {
    return _.filter(this.bookMarks, (object) => {
      return (
        !_.includes(['Link Button'], object.value) &&
        !_.includes(['View Update(s) Link'], object.value) &&
        !_.includes(['View Challenge / Opportunity Link'], object.value)
      );
    });
  }
}
