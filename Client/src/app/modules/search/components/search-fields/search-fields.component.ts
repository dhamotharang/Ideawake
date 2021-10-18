import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-fields',
  templateUrl: './search-fields.component.html',
  styleUrls: ['./search-fields.component.scss']
})
export class SearchFieldsComponent {
  @Input() data;
  text;

  @Output() openDropdown = new EventEmitter<boolean>();
  @Output() selectField = new EventEmitter();
  @Output() searchTerm = new EventEmitter<string>();

  constructor() {}

  createDate(date: string) {
    const now = new Date(date);
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  }
}
