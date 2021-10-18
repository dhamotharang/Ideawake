import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

@Component({
  selector: 'app-mention-add',
  templateUrl: './mention-add.component.html',
  styleUrls: ['./mention-add.component.scss']
})
export class MentionAddComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() item;
  constructor() {}

  ngOnInit() {}
}
