import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-comments-loader',
  templateUrl: './comments-loader.component.html',
  styleUrls: ['./comments-loader.component.scss']
})
export class CommentsLoaderComponent implements OnInit {
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
