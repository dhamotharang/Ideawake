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
  selector: 'app-field-textarea',
  templateUrl: './field-textarea.component.html',
  styleUrls: ['./field-textarea.component.scss']
})
export class FieldTextareaComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data = new EventEmitter();

  fieldDataType = FIELD_DATA_TYPE;
  text;
  backupText;
  htmlText;

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
    if (
      this.customField &&
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length
    ) {
      this.text = this.customField.opportunityFieldData[0].fieldData.text;
      this.backupText = this.text;
      this.htmlText = Utility.linkify(this.text);
      this.dataAvailable = true;
      if (!this.view) {
        this.data.emit(this.text);
      }
    }
  }

  saveChanges() {
    if (this.text) {
      this.dataAvailable = true;
      this.backupText = this.text;
      this.htmlText = Utility.linkify(this.text);
    }
    this.editMode = false;
    this.data.emit(this.text);
  }
}
