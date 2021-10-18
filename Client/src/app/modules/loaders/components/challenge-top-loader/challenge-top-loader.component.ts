import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-challenge-top-loader',
  templateUrl: './challenge-top-loader.component.html',
  styleUrls: ['./challenge-top-loader.component.scss']
})
export class ChallengeTopLoaderComponent implements OnInit, OnChanges {
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
