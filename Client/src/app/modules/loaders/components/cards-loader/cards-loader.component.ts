import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cards-loader',
  templateUrl: './cards-loader.component.html',
  styleUrls: ['./cards-loader.component.scss']
})
export class CardsLoaderComponent implements OnInit {
  @Input() count = 1;
  @Input() type = 'circle';
  @Input() style = {
    width: '17em',
    height: '17em',
    'border-radius': '5px',
    'background-color': '#D3D3D3',
    'margin-right': '10px'
  };

  constructor() {}

  ngOnInit() {}
}
