import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { get } from 'lodash';

@Component({
  selector: 'app-prize-widget',
  templateUrl: './prize-widget.component.html',
  styleUrls: ['./prize-widget.component.scss']
})
export class PrizeWidgetComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() userPermissions;
  @Input() prize;
  @Output() updated = new EventEmitter<any>();
  constructor() {}
  ngOnInit() {}

  prizeAwarded(e) {
    this.updated.emit(true);
  }

  getUserName(user) {
    return `${get(user, 'firstName', '')} ${get(user, 'lastName', '')}`;
  }
  getUserImage(user) {
    return get(user, 'profileImage.url', 'https://via.placeholder.com/40x40');
  }
}
