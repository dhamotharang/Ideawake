import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { EngagementModalComponent } from '../engagement-modal/engagement-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-social-images',
  templateUrl: './social-images.component.html',
  styleUrls: ['./social-images.component.scss']
})
export class SocialImagesComponent implements OnInit, OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() upvoters;
  @Input() followers;
  @Input() entityType;
  public ideaUpvoters;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  ngOnChanges() {}
  openEngagementModal() {
    const modalRef = this.modalService.open(EngagementModalComponent, {
      windowClass: 'modalSize'
    });
    modalRef.componentInstance.upvoters = this.upvoters;
    modalRef.componentInstance.followers = this.followers;
    modalRef.componentInstance.entityType = this.entityType;
    modalRef.componentInstance.modalRef = modalRef;
  }
}
