import { Component, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

@Component({
  selector: 'app-selected-access',
  templateUrl: './selected-access.component.html',
  styleUrls: ['./selected-access.component.scss']
})
export class SelectedAccessComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  constructor() {}

  ngOnInit() {}
}
