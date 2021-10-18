import {
  Component,
  OnChanges,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-search-inline',
  templateUrl: './search-inline.component.html',
  styleUrls: ['./search-inline.component.scss']
})
export class SearchInlineComponent implements OnChanges {
  @Input() clear = false;
  @Input() showIcon = true;
  @Output() search: EventEmitter<any> = new EventEmitter<any>();
  modelChanged: Subject<string> = new Subject<string>();
  @Input() text = '';
  constructor() {
    this.modelChanged.pipe(debounceTime(500)).subscribe((model) => {
      this.search.emit(model);
    });
  }

  ngOnChanges() {
    if (this.clear) {
      this.text = '';
    }
  }

  onSearch(val) {
    this.modelChanged.next(val);
  }
}
