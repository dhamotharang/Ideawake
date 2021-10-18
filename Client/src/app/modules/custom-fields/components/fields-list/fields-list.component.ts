import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CustomFieldDetailComponent } from '../custom-field-detail/custom-field-detail.component';

@Component({
  selector: 'app-fields-list',
  templateUrl: './fields-list.component.html',
  styleUrls: ['./fields-list.component.scss']
})
export class FieldsListComponent implements OnInit {
  @Input() data;

  @Output() remove = new EventEmitter();
  @Output() update = new EventEmitter();

  constructor(private modalService: NgbModal) {}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
    this.update.emit(this.data);
  }

  ngOnInit() {}

  editField(field, index) {
    const editModalRef = this.modalService.open(CustomFieldDetailComponent, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
    editModalRef.componentInstance.id = field.id;
    editModalRef.componentInstance.isEdit = true;
    editModalRef.componentInstance.modalRef = editModalRef;
    editModalRef.componentInstance.outPutResult.subscribe((result) => {
      if (result) {
        if (!result.close) {
          this.data[index] = result;
        }
        editModalRef.close('closed');
      } else {
        editModalRef.close('cancel');
      }
    });
  }
}
