import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ideas-list-bubbles',
  templateUrl: './ideas-list-bubbles.component.html',
  styleUrls: ['./ideas-list-bubbles.component.scss']
})
export class IdeasListBubblesComponent implements OnInit {
  constructor() {}
  dateFrom;
  dateTo;
  ngOnInit() {}
  sortFilter(event) {}
  dateFilter(event) {}
}
