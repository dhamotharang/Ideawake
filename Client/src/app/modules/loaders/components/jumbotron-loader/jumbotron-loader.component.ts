import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-jumbotron-loader',
  templateUrl: './jumbotron-loader.component.html',
  styleUrls: ['./jumbotron-loader.component.scss']
})
export class JumbotronLoaderComponent implements OnInit, OnChanges {
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
