import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-archive-idea-modal',
  templateUrl: './archive-idea-modal.component.html',
  styleUrls: ['./archive-idea-modal.component.scss']
})
export class ArchiveIdeaModalComponent implements OnInit {
  @Input() idea;
  @Output() archive = new EventEmitter<void>();

  constructor(public modal: NgbActiveModal) {}

  ngOnInit() {}
}
