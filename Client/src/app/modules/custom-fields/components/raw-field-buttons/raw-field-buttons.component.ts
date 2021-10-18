import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-raw-field-buttons',
  templateUrl: './raw-field-buttons.component.html',
  styleUrls: ['./raw-field-buttons.component.scss']
})
export class RawFieldButtonsComponent implements OnInit {
  constructor() {}

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  ngOnInit() {}
}
