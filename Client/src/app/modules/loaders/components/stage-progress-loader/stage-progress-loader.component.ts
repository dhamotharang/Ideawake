import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-stage-progress-loader',
  templateUrl: './stage-progress-loader.component.html',
  styleUrls: ['./stage-progress-loader.component.scss']
})
export class StageProgressLoaderComponent implements OnInit {
  @Input() count = 1;
  @Input() window = false;

  arr;
  constructor() { }

  ngOnInit() {
    this.arr = Array(this.count);
  }

  ngOnChanges() {
    if (this.count !== 1) {
      this.arr = Array(this.count);
    }
  }

}
