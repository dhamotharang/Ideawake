import { Component, OnInit } from '@angular/core';
import { faStar as farStar } from '@fortawesome/pro-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'app-review-complete',
  templateUrl: './review-complete.component.html',
  styleUrls: ['./review-complete.component.scss']
})
export class ReviewCompleteComponent implements OnInit {
  icon = farStar;

  constructor() {}

  onMouseEnter() {
    this.icon = fasStar;
  }

  onMouseLeave() {
    this.icon = farStar;
  }

  ngOnInit() {}
}
