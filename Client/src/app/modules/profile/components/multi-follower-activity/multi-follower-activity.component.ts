import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-multi-follower-activity',
  templateUrl: './multi-follower-activity.component.html'
})
export class MultiFollowerActivityComponent implements OnInit {
  @Input() act;
  closeResult: string;

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}
}
