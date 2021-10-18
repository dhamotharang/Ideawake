import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import {
  ENTITY_FOLDER,
  FIELD_DATA_TYPE,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';

@Component({
  selector: 'app-field-upload-image',
  templateUrl: './field-upload-image.component.html',
  styleUrls: ['./field-upload-image.component.scss']
})
export class FieldUploadImageComponent implements OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
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
