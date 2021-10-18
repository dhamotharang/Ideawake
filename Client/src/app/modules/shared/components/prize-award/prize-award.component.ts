import { first, get, last, map, split } from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NotificationService, PrizeApiService } from '../../../../services';
import {
  PRIZE_CANDIDATE_TYPE,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';

@Component({
  selector: 'app-prize-award',
  templateUrl: './prize-award.component.html',
  styleUrls: ['./prize-award.component.scss']
})
export class PrizeAwardComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  beforeDismiss: () => boolean | Promise<boolean>;
  @Input() userPermissions;
  @Input() prize;
  @Output() awarded = new EventEmitter<any>();
  closeResult: string;
  message: string;
  prizeCandidateType = PRIZE_CANDIDATE_TYPE;
  items = [];
  selected = [];
  selectedItems = [];
  constructor(
    private modalService: NgbModal,
    private NotificationService: NotificationService,
    private prizeApiService: PrizeApiService
  ) {}

  ngOnInit() {}

  disableAward() {
    const winners =
      get(this.prize, 'totalWinners', 0) -
      get(this.prize, 'awardees.length', 0);
    if (winners == 0) return true;
    else return false;
  }

  getPrizeCandidates() {
    this.prizeApiService
      .getPrizeCandidates(this.prize.id)
      .subscribe((res: any) => {
        this.items = map(res.response, (value) => {
          if (value.type == this.prizeCandidateType.USER) {
            const temp = value.candidate;
            temp.selection = value.candidate.id + '|' + value.type;
            temp.name =
              value.candidate.firstName + ' ' + value.candidate.lastName;
            temp.type = value.type;
            return temp;
          } else if (value.type == this.prizeCandidateType.OPPORTUNITY) {
            const temp = value.candidate;
            temp.selection = value.candidate.id + '|' + value.type;
            temp.name = value.candidate.title;
            temp.type = value.type;
            return temp;
          }
        });
      });
  }

  getSelected() {
    this.selectedItems = map(this.selected, (value) => {
      const temp = split(value, '|', 2);
      return {
        candidateId: parseInt(first(temp)),
        type: last(temp)
      };
    });
  }

  open(content) {
    if (this.prize && this.prize.id) {
      this.getPrizeCandidates();
      this.selected = [];
      this.selectedItems = [];
      this.message = '';
    }
    this.modalService
      .open(content, {
        windowClass: 'custom-field-modal',
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        beforeDismiss: this.beforeDismiss
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${reason}`;
        }
      );
  }
  submitAwards() {
    const data = {
      prizeId: this.prize.id,
      awardees: this.selectedItems,
      message: this.message
    };
    this.modalService.dismissAll();
    this.prizeApiService.postAwardPrize(data).subscribe((res: any) => {
      this.NotificationService.showSuccess('Prize awarded successfully.');
      this.awarded.emit(true);
    });
  }
}
