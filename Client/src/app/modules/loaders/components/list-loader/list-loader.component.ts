import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-list-loader',
  templateUrl: './list-loader.component.html',
  styleUrls: ['./list-loader.component.scss']
})
export class ListLoaderComponent implements OnInit {
  @Input() count = 1;
  @Input() style = {
    'border-radius': '5',
    height: '50px'
  };

  constructor() {}

  ngOnInit() {}
}
