import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CustomFieldDetailComponent } from '../custom-field-detail/custom-field-detail.component';
import { CustomFieldsTypesComponent } from '../custom-field-types/custom-field-types.component';

@Component({
  selector: 'app-custom-field-create',
  templateUrl: './custom-field-create.component.html',
  styleUrls: ['./custom-field-create.component.scss']
})
export class CustomFieldCreateComponent implements OnInit {
  @Input() smallButton = false;
  @Output() updated = new EventEmitter<any>();
  closeResult: string;
  addMultipleFieldGroups = false;
  fieldDescription = false;
  customPlaceholder = false;
  singleOrMultipleSelect = false;
  numberField = false;
  calculatedField = false;
  userField = false;
  benefitField = false;
  costField = false;
  knowledgeField = false;
  datepickerField = false;

  toggleFieldGroups() {
    this.addMultipleFieldGroups = !this.addMultipleFieldGroups;
  }

  toggleFieldDescription() {
    this.fieldDescription = !this.fieldDescription;
  }

  toggleFieldPlaceholder() {
    this.customPlaceholder = !this.customPlaceholder;
  }

  toggleFieldTypeMultiSelect() {
    this.singleOrMultipleSelect = !this.singleOrMultipleSelect;
  }

  toggleFieldTypeNumber() {
    this.numberField = !this.numberField;
  }

  toggleFieldTypeCalculated() {
    this.calculatedField = !this.calculatedField;
  }

  toggleFieldTypeUser() {
    this.userField = !this.userField;
  }

  toggleFieldTypeBenefit() {
    this.benefitField = !this.benefitField;
  }

  toggleFieldTypeCost() {
    this.costField = !this.costField;
  }

  toggleFieldTypeKnowledge() {
    this.knowledgeField = !this.knowledgeField;
  }

  toggleFieldDatepicker() {
    this.datepickerField = !this.datepickerField;
  }

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  openCustomFieldsTypes() {
    const modalRef = this.modalService.open(CustomFieldsTypesComponent, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
    modalRef.componentInstance.addNew = true;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.outPutResult.subscribe((result) => {
      if (result) {
        if (!result.close) {
          this.addCustomField(result.type);
        }
        modalRef.close('closed');
      } else {
        modalRef.close('cancel');
      }
    });
  }

  addCustomField(type) {
    const addModalRef = this.modalService.open(CustomFieldDetailComponent, {
      windowClass: 'custom-field-modal',
      backdrop: 'static',
      ariaLabelledBy: 'modal-basic-title'
    });
    addModalRef.componentInstance.type = type;
    addModalRef.componentInstance.modalRef = addModalRef;
    addModalRef.componentInstance.outPutResult.subscribe((result) => {
      if (result) {
        if (!result.close) {
          this.updated.emit(result);
        }
        addModalRef.close('closed');
      } else {
        addModalRef.close('cancel');
      }
    });
  }
}
