import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-list-loader',
  templateUrl: './content-list-loader.component.html',
  styleUrls: ['./content-list-loader.component.scss']
})
export class ContentListLoaderComponent implements OnInit {
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
