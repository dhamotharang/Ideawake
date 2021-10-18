import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-outcome-types',
  templateUrl: './outcome-types.component.html',
  styleUrls: ['./outcome-types.component.scss']
})
export class OutcomeTypesComponent implements OnInit {
  closeResult: string;

  timeSavings = false;
  timeInvestment = false;
  resourceSavings = false;
  resourceInvestment = false;

  toggleTimeSavings() {
    this.timeSavings = !this.timeSavings;
  }

  toggleTimeInvestment() {
    this.timeInvestment = !this.timeInvestment;
  }

  toggleResourceSavings() {
    this.resourceSavings = !this.resourceSavings;
  }

  toggleResourceInvestment() {
    this.resourceInvestment = !this.resourceInvestment;
  }

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this.modalService.open(content, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
  }
}
