import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pivot-chart',
  templateUrl: './pivot-chart.component.html',
  styleUrls: ['./pivot-chart.component.scss']
})
export class PivotChartComponent implements OnInit {
  constructor(private modalService: NgbModal) {}
  modalRef;
  configureTable: any;
  entity: any;
  appliedFilters: any;
  dateFrom: any;
  dateTo: any;

  ngOnInit() {}

  open(content) {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'custom-field-modal'
      // size: 'lg'
    });
  }
  applyFilters($event) {}
  dateFilter($event) {}
  sortFilter($event) {}
}
