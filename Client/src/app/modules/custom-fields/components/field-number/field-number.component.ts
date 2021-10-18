import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';

import { FIELD_DATA_TYPE } from '../../../../utils';
import { Utility } from 'src/app/utils/utility';

@Component({
  selector: 'app-field-number',
  templateUrl: './field-number.component.html',
  styleUrls: ['./field-number.component.scss']
})
export class FieldNumberComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data = new EventEmitter<number>();

  fieldDataType = FIELD_DATA_TYPE;
  number;
  prefix: any;
  suffix: any;
  backupNumber;

  dataAvailable = false;
  editMode = false;

  @ViewChild('input', { static: false }) elElement: ElementRef;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  autoFocus() {
    this.editMode = true;
    this.changeDetectorRef.detectChanges();
    this.elElement.nativeElement.focus();
  }

  ngOnChanges() {
    this.prefix = this.customField.fieldDataObject.data.prefix
      ? this.customField.fieldDataObject.data.prefix
      : '';
    this.suffix = this.customField.fieldDataObject.data.suffix
      ? this.customField.fieldDataObject.data.suffix
      : '';
    if (
      this.customField &&
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length &&
      this.customField.opportunityFieldData[0].fieldData.number !== null &&
      !isNaN(this.customField.opportunityFieldData[0].fieldData.number)
    ) {
      this.number = Utility.replaceWithComma(
        this.customField.opportunityFieldData[0].fieldData.number.toString()
      );
      this.backupNumber = this.number;
      this.dataAvailable = true;
      if (!this.view) {
        this.data.emit(parseInt(this.number.toString().replace(/,/g, '')));
      }
    }
  }

  addComas(event) {
    // skip for arrow keys
    if (event.which >= 37 && event.which <= 40) return;
    this.number = Utility.replaceWithComma(this.number);
  }

  saveChanges() {
    if (this.number != null && this.number != '') {
      this.dataAvailable = true;
      this.backupNumber = this.number;
      this.number = parseInt(this.number.toString().replace(/,/g, ''));
    } else {
      this.dataAvailable = false;
      this.number = null;
    }
    this.editMode = false;
    this.data.emit(this.number);
  }
}
