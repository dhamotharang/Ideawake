import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TableColumnConfig, TablePaginationConfig } from 'src/app/utils';

@Component({
  selector: 'app-custom-data-table',
  templateUrl: './custom-data-table.component.html',
  styleUrls: ['./custom-data-table.component.scss']
})
export class CustomDataTableComponent implements OnInit {
  @Input() columnConfigs: TableColumnConfig[];
  @Input() rows: any[];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number;
  @Output() changePageEmitter = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  changePage(event: TablePaginationConfig) {
    this.changePageEmitter.emit(event);
  }
}
