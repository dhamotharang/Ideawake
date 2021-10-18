import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-merged-list',
  templateUrl: './merged-list.component.html',
  styleUrls: ['./merged-list.component.scss']
})
export class MergedListComponent implements OnInit {
  viewDetails = false;

  toggleDetails() {
    this.viewDetails = !this.viewDetails;
  }

  constructor() {}

  ngOnInit() {}
}
