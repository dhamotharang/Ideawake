import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { ENTITY_FOLDER, FIELD_DATA_TYPE } from '../../../../utils';

@Component({
  selector: 'app-field-upload',
  templateUrl: './field-upload.component.html',
  styleUrls: ['./field-upload.component.scss']
})
export class FieldUploadComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data = new EventEmitter();

  fieldDataType = FIELD_DATA_TYPE;
  file;
  s3Folder = ENTITY_FOLDER;

  backupFile;
  editMode = false;

  constructor() {}

  ngOnChanges() {
    if (
      this.customField &&
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length
    ) {
      this.file = this.customField.opportunityFieldData[0].fieldData.file;
      this.backupFile = this.file;
      if (!this.view) {
        this.data.emit(this.file);
      }
    }
  }

  setFile(file) {
    this.file = file;
    if (!this.view) {
      this.data.emit(this.file);
    }
  }

  editFile(fileUpload) {
    this.file = null;
    fileUpload.fileInput.nativeElement.click();
  }

  removeFile() {
    this.file = null;
    if (!this.view) {
      this.data.emit(this.file);
    }
  }

  saveChanges() {
    if (this.file) {
      this.backupFile = this.file;
    }
    this.editMode = false;
    this.data.emit(this.file);
  }

  cancelChanges() {
    this.file = this.backupFile;
    this.editMode = false;
  }
}
