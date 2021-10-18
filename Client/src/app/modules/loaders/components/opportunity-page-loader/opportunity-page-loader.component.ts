import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-opportunity-page-loader',
  templateUrl: './opportunity-page-loader.component.html',
  styleUrls: ['./opportunity-page-loader.component.scss']
})
export class OpportunityPageLoaderComponent implements OnInit, OnChanges {
  @Input() count = 1;
  @Input() window = false;

  arr;
  constructor() {}

  ngOnInit() {
    this.arr = Array(this.count);
  }

  ngOnChanges() {
    if (this.count !== 1) {
      this.arr = Array(this.count);
    }
  }
}
