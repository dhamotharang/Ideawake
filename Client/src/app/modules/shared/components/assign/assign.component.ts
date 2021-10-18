import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss']
})
export class AssignComponent implements OnInit {
  constructor() {}

  specificMembers = false;
  specificMembersStageVisibility = false;

  toggleSpecificMembers() {
    this.specificMembers = !this.specificMembers;
  }

  toggleSpecificMembersStageActivity() {
    this.specificMembersStageVisibility = !this.specificMembersStageVisibility;
  }

  ngOnInit() {}
}
