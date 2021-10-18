import { Component, Input, OnInit } from '@angular/core';

import {
  CUSTOM_FIELD_TYPES,
  FIELD_DATA_TYPE,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../../utils';

@Component({
  selector: 'app-history-data',
  templateUrl: './history-data.component.html',
  styleUrls: ['./history-data.component.scss']
})
export class HistoryDataComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() dataType;
  @Input() customField;
  @Input() history;

  fieldTypes = CUSTOM_FIELD_TYPES;
  fieldDataTypes = FIELD_DATA_TYPE;

  constructor() {}

  ngOnInit() {}
}
