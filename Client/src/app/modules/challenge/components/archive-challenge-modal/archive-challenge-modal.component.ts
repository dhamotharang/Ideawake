import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-archive-challenge-modal',
  templateUrl: './archive-challenge-modal.component.html',
  styleUrls: ['./archive-challenge-modal.component.scss']
})
export class ArchiveChallengeModalComponent {
  @Output() archive = new EventEmitter<void>();
  constructor(public modal: NgbActiveModal) {}
}
