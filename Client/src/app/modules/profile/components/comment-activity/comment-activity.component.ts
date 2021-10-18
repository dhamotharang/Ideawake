import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-comment-activity',
  templateUrl: './comment-activity.component.html'
})
export class CommentActivityComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() act;
  @Input() currUser;

  closeResult: string;

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}
}
