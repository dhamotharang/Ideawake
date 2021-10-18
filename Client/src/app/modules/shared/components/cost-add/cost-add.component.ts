import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cost-add',
  templateUrl: './cost-add.component.html',
  styleUrls: ['./cost-add.component.scss']
})
export class CostAddComponent implements OnInit {
  constructor() {}

  addCost = false;

  toggleCost() {
    this.addCost = !this.addCost;
  }

  ngOnInit() {}
}
