import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-lock-component',
  templateUrl: './lock-component.component.html',
  styleUrls: ['./lock-component.component.scss']
})
export class LockComponentComponent implements OnInit {
  @Input() tooltip = "You currently don't have access";
  @Input() class = 'unauthorized';

  /* NgStyle = `{
    'position': 'absolute',
    'z-index': '1000',
    'right': '0.5rem',
    'bottom': '3.7rem',
    'color': 'grey',
    'border-top-right-radius': '0.15rem',
    'padding': '0.25rem 0.5rem'
  }`; */
  constructor() {}

  ngOnInit() {}
}
