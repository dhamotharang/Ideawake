import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss']
})
export class TablePaginationComponent implements OnChanges {
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageNumber = 1;
  @Input() maxSize = 8;
  @Output() changePage = new EventEmitter<any>();
  @Output() skip = new EventEmitter<any>();
  startPage = 0;
  endPage = 0;
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    this.calculate();
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'totalCount': {
            if (this.totalCount) {
              this.pageChange(1, true);
            }
          }
        }
      }
    }
  }
  calculate() {
    this.startPage = (this.pageNumber - 1) * this.pageSize + 1;
    const totalPage = Math.ceil(this.totalCount / this.pageSize);
    if (this.pageNumber < totalPage) {
      this.endPage = this.pageNumber * this.pageSize;
    } else {
      this.endPage = this.totalCount;
    }
  }
  changePageSize(event) {
    this.pageSize = event;
    this.pageNumber = 1;
    this.pageChange(this.pageNumber);
  }

  pageChange(event?, firstLoad?) {
    this.pageNumber = event || 1;
    const takeRecords = this.pageSize;
    const skipRecords = this.pageNumber * this.pageSize - this.pageSize;
    this.changePage.emit({ take: takeRecords, skip: skipRecords, firstLoad });
    this.calculate();
  }
}
