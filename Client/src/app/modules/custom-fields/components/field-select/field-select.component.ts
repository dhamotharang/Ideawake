import { cloneDeep, find } from 'lodash';

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  ViewEncapsulation,
  Output,
  ViewChild
} from '@angular/core';

import { FIELD_DATA_TYPE } from '../../../../utils';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-field-select',
  templateUrl: './field-select.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./field-select.component.scss']
})
export class FieldSelectComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data = new EventEmitter();
  @Output() searchTerm = new EventEmitter<string>();

  fieldDataType = FIELD_DATA_TYPE;
  selected;
  selectedOption;
  loaded;

  backupSelected;
  dataAvailable = false;
  editMode = false;

  @ViewChild('select', { static: false }) ngselect: NgSelectComponent;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  autoFocus() {
    this.editMode = true;
    this.changeDetectorRef.detectChanges();
    this.ngselect.open();
  }

  ngOnChanges() {
    if (this.customField) {
      this.loaded = this.customField.fieldDataObject.data;
    }

    if (
      this.customField &&
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length
    ) {
      this.selected = this.customField.opportunityFieldData[0].fieldData.selected;
      this.selectedOption = find(this.customField.fieldDataObject.data, {
        value: this.selected
      });

      this.backupSelected = cloneDeep(this.selected);
      this.dataAvailable = true;
      if (!this.view) {
        this.data.emit(this.selected);
      }
    }
  }

  emitData() {
    this.data.emit(this.selected);
  }

  emitSearchTerm(term) {
    this.searchTerm.emit(term.term);
  }

  saveChanges() {
    if (this.selected) {
      this.dataAvailable = true;
      this.backupSelected = cloneDeep(this.selected);
    }
    this.editMode = false;
    this.data.emit(this.selected);
  }

  cancelChanges() {
    this.selected = cloneDeep(this.backupSelected);
    this.editMode = false;
  }
}
