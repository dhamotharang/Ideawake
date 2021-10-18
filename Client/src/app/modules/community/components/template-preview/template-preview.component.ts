import { Component, OnInit, Input } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import {
  COMMUNITY_APPEARANCE,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
@Component({
  selector: 'app-template-preview',
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() title = 'Header';
  @Input() body = '';
  @Input() featureImage = '';
  @Input() footer = '';
  @Input() subject = '';
  public currentUser = this.ngRedux.getState().userState;
  public communityLogo = '';
  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>
  ) {}
  ngOnInit() {
    const currentCommunity = _.find(this.currentUser.user['communities'], [
      'id',
      this.currentUser.currentCommunityId
    ]);
    this.communityLogo =
      currentCommunity.emailLogo || COMMUNITY_APPEARANCE.defaultLogo;
  }
  close() {
    this.modalService.dismissAll();
  }
}
