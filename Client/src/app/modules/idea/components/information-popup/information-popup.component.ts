import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

@Component({
  selector: 'app-information-popup',
  templateUrl: './information-popup.component.html',
  styleUrls: ['./information-popup.component.scss']
})
export class InformationPopupComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() config;

  constructor() {}

  ngOnInit() {}

  getUserImage(user) {
    return user && user.profileImage.url
      ? user.profileImage.url
      : 'https://via.placeholder.com/40x40';
  }
}
