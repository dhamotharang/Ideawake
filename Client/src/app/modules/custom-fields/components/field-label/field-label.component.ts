import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-field-label',
  templateUrl: './field-label.component.html',
  styleUrls: ['./field-label.component.scss']
})
export class FieldLabelComponent implements OnInit {
  @Input() customField;
  constructor() {}

  ngOnInit() {}
}
