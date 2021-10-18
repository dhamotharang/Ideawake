import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-non-financial-benefit-add',
  templateUrl: './non-financial-benefit-add.component.html',
  styleUrls: ['./non-financial-benefit-add.component.scss']
})
export class NonFinancialBenefitAddComponent implements OnInit {
  constructor() {}

  nonFinancialBenefit = false;

  toggleNonFinancialBenefit() {
    this.nonFinancialBenefit = !this.nonFinancialBenefit;
  }

  ngOnInit() {}
}
