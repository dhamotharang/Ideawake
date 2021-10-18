import { Component, Input, OnInit } from '@angular/core';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-post-activity',
  templateUrl: './post-activity.component.html'
})
export class PostActivityComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() act;
  @Input() currUser;

  closeResult: string;

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}
}
