import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CustomFieldApiService } from '../../../../services';
import { CustomFieldCategories } from '../../../../utils';

@Component({
  selector: 'app-custom-field-types',
  templateUrl: './custom-field-types.component.html'
})
export class CustomFieldsTypesComponent implements OnInit {
  @Input() addNew = false;
  @Output() outPutResult = new EventEmitter<any>();
  categories = CustomFieldCategories;
  backupList = [];
  types = [];
  constructor(
    private ngbModal: NgbModal,
    private customFieldApiService: CustomFieldApiService
  ) {}

  ngOnInit() {
    this.getTypes();
  }

  public getTypes() {
    this.customFieldApiService.getTypes().subscribe((res: any) => {
      this.backupList = _.cloneDeep(res.response);
      this.types = _.groupBy(res.response, 'category');
    });
  }

  public categoryTypes(category) {
    return _.get(this.types, category.key, []);
  }

  public searchList(value) {
    const filtered = _.filter(this.backupList, (s) => {
      const title = _.toLower(s.title);
      value = _.toLower(value);
      return title.indexOf(value) !== -1;
    });
    this.types = _.groupBy(filtered, 'category');
  }

  public selectType(type) {
    this.outPutResult.emit({ type });
  }

  public close() {
    this.outPutResult.emit({ close: true });
  }
}
