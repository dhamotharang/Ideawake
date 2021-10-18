import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-benefit-add',
  templateUrl: './benefit-add.component.html',
  styleUrls: ['./benefit-add.component.scss']
})
export class BenefitAddComponent implements OnInit {
  constructor() {}

  addBenefit = false;

  toggleBenefit() {
    this.addBenefit = !this.addBenefit;
  }

  ngOnInit() {}
}
