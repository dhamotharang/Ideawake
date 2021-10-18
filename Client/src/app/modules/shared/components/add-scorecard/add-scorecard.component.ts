import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-scorecard',
  templateUrl: './add-scorecard.component.html',
  styleUrls: ['./add-scorecard.component.scss']
})
export class AddScorecardComponent implements OnInit {
  editLabels = false;
  scorecardSections = false;
  criteriaDescription = false;

  toggleLabels() {
    this.editLabels = !this.editLabels;
  }

  toggleSections() {
    this.scorecardSections = !this.scorecardSections;
  }

  toggleCriteriaDescription() {
    this.criteriaDescription = !this.criteriaDescription;
  }

  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this.modalService
      .open(content, {
        windowClass: 'custom-field-modal',
        ariaLabelledBy: 'modal-basic-title',
        beforeDismiss: this.beforeDismiss
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }
}
