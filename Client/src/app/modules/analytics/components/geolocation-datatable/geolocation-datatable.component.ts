import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-geolocation-datatable',
  templateUrl: './geolocation-datatable.component.html',
  styleUrls: ['./geolocation-datatable.component.scss']
})
export class GeolocationDatatableComponent implements OnInit {
  @Input() analytics;
  constructor() {}

  ngOnInit() {}
}
