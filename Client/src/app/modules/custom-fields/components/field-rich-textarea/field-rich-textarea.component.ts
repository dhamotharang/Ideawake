import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { FIELD_DATA_TYPE } from '../../../../utils';

@Component({
  selector: 'app-field-rich-textarea',
  templateUrl: './field-rich-textarea.component.html',
  styleUrls: ['./field-rich-textarea.component.scss']
})
export class FieldRichTextareaComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data = new EventEmitter();

  fieldDataType = FIELD_DATA_TYPE;
  text;
  backupText;

  dataAvailable = false;
  editMode = false;

  constructor() {}

  ngOnChanges() {
    if (
      this.customField &&
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length
    ) {
      this.text = this.customField.opportunityFieldData[0].fieldData.text;
      this.backupText = this.text;
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
    }
    this.editMode = false;
    this.data.emit(this.text);
  }

  updateText(event) {
    this.text = event;
    if (!this.view) {
      this.data.emit(this.text);
    }
  }
}
