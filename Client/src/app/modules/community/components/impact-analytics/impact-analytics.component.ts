import { Component, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

@Component({
  selector: 'app-impact-analytics',
  templateUrl: './impact-analytics.component.html',
  styleUrls: ['./impact-analytics.component.scss']
})
export class ImpactAnalyticsComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  constructor() {}

  ngOnInit() {}
}
