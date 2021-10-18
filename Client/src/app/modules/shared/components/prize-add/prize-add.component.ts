import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrizeAddEditComponent } from '../prize-add-edit/prize-add-edit.component';
@Component({
  selector: 'app-prize-add',
  templateUrl: './prize-add.component.html',
  styleUrls: ['./prize-add.component.scss']
})
export class PrizeAddComponent implements OnInit {
  @Input() userPermissions;
  @Output() dataSet = new EventEmitter<boolean>();

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open() {
    const modalRef = this.modalService.open(PrizeAddEditComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.dataSet.subscribe((data) => {
      this.dataSet.emit(data);
      modalRef.close();
    });
    modalRef.componentInstance.close.subscribe((closed) => {
      modalRef.close();
    });
  }
}
