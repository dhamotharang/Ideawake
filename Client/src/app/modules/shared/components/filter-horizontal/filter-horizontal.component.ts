import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-horizontal',
  templateUrl: './filter-horizontal.component.html',
  styleUrls: ['./filter-horizontal.component.scss']
})
export class FilterHorizontalComponent implements OnInit, AfterViewInit {
  @Input() length: any;
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {}
}
