import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { get } from 'lodash';
@Component({
  selector: 'app-idea-team-images',
  templateUrl: './idea-team-images.component.html',
  styleUrls: ['./idea-team-images.component.scss']
})
export class IdeaTeamImagesComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() users = [];
  constructor() {}
  ngOnInit() {}
  getUserName(user) {
    return `${get(user, 'user.firstName', '')} ${get(
      user,
      'user.lastName',
      ''
    )}`;
  }
  getUserImage(user) {
    return get(
      user,
      'user.profileImage.url',
      'https://via.placeholder.com/40x40'
    );
  }
}
