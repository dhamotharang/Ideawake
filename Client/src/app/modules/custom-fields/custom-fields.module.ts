import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule } from '@tinymce/tinymce-angular';

import { CDKModule } from '../../cdk-module';
import { CustomFieldApiService } from '../../services';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { UploadsModule } from '../uploads/uploads.module';
import {
  ConfigureBenefitFieldComponent,
  ConfigureCalculatedFieldComponent,
  ConfigureCostFieldComponent,
  ConfigureDatepickerFieldComponent,
  ConfigureGroupFieldComponent,
  ConfigureKnowledgeFieldComponent,
  ConfigureNumberFieldComponent,
  ConfigureSelectFieldComponent,
  ConfigureUserFieldComponent,
  CustomFieldCreateComponent,
  CustomFieldDetailComponent,
  CustomFieldEditSingleSelectComponent,
  CustomFieldsComponent,
  CustomFieldsTypesComponent,
  CustomFieldSubmissionFormComponent,
  FieldAccessBadgesComponent,
  FieldDatepickerComponent,
  FieldHistoryComponent,
  FieldInputComponent,
  FieldKnowledgeComponent,
  FieldLabelComponent,
  FieldListComponent,
  FieldMultiselectComponent,
  FieldNumberComponent,
  FieldProjectedBenefitsComponent,
  FieldProjectedCostsComponent,
  FieldRichTextareaComponent,
  FieldSelectComponent,
  FieldsListComponent,
  FieldTextareaComponent,
  FieldUploadComponent,
  FieldUploadImageComponent,
  FieldUploadVideoComponent,
  FieldUserGroupComponent,
  HistoryDataComponent,
  RawFieldButtonsComponent,
  BulkAttachCustomFieldListComponent
} from './components';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [
    CustomFieldCreateComponent,
    CustomFieldEditSingleSelectComponent,
    FieldDatepickerComponent,
    FieldHistoryComponent,
    FieldInputComponent,
    FieldKnowledgeComponent,
    FieldListComponent,
    FieldMultiselectComponent,
    FieldNumberComponent,
    FieldProjectedBenefitsComponent,
    FieldProjectedCostsComponent,
    FieldRichTextareaComponent,
    FieldSelectComponent,
    FieldTextareaComponent,
    FieldUploadComponent,
    FieldUploadImageComponent,
    FieldUploadVideoComponent,
    FieldUserGroupComponent,
    FieldsListComponent,
    CustomFieldsTypesComponent,
    CustomFieldDetailComponent,
    CustomFieldSubmissionFormComponent,
    CustomFieldsComponent,
    ConfigureGroupFieldComponent,
    ConfigureNumberFieldComponent,
    ConfigureSelectFieldComponent,
    ConfigureBenefitFieldComponent,
    ConfigureCostFieldComponent,
    ConfigureKnowledgeFieldComponent,
    ConfigureCalculatedFieldComponent,
    ConfigureDatepickerFieldComponent,
    ConfigureUserFieldComponent,
    FieldAccessBadgesComponent,
    RawFieldButtonsComponent,
    FieldLabelComponent,
    HistoryDataComponent,
    BulkAttachCustomFieldListComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    NgbModule,
    SharedModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SearchModule,
    DragDropModule,
    CDKModule,
    NgSelectModule,
    UploadsModule,
    EditorModule,
    LazyLoadImageModule
  ],
  providers: [CustomFieldApiService],
  exports: [
    CustomFieldCreateComponent,
    CustomFieldEditSingleSelectComponent,
    FieldDatepickerComponent,
    FieldHistoryComponent,
    FieldInputComponent,
    FieldKnowledgeComponent,
    FieldListComponent,
    FieldMultiselectComponent,
    FieldNumberComponent,
    FieldProjectedBenefitsComponent,
    FieldProjectedCostsComponent,
    FieldRichTextareaComponent,
    FieldSelectComponent,
    FieldTextareaComponent,
    FieldUploadComponent,
    FieldUploadImageComponent,
    FieldUploadVideoComponent,
    FieldUserGroupComponent,
    FieldsListComponent,
    CustomFieldsTypesComponent,
    CustomFieldDetailComponent,
    CustomFieldSubmissionFormComponent,
    CustomFieldsComponent,
    FieldAccessBadgesComponent,
    RawFieldButtonsComponent,
    FieldLabelComponent,
    BulkAttachCustomFieldListComponent
  ],
  entryComponents: [CustomFieldsTypesComponent, CustomFieldDetailComponent]
})
export class CustomFieldsModule {}
