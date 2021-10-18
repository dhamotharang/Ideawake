import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-comment-mention-activity',
  templateUrl: './comment-mention-activity.component.html'
})
export class CommentMentionActivityComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() act;
  @Input() currUser;

  closeResult: string;

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  parseBody(body: string) {
    // TODO need to set href
    return body.replace(/(@.*?\s)/, '<a href="$1">$1</a>');
  }
}
