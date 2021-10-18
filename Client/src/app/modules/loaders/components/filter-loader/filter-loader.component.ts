import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-loader',
  templateUrl: './filter-loader.component.html',
  styleUrls: ['./filter-loader.component.scss']
})
export class FilterLoaderComponent implements OnInit {
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
