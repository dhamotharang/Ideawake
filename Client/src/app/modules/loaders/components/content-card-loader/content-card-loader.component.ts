import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-card-loader',
  templateUrl: './content-card-loader.component.html',
  styleUrls: ['./content-card-loader.component.scss']
})
export class ContentCardLoaderComponent implements OnInit, OnChanges {
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
