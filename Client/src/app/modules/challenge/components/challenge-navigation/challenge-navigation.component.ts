import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-challenge-navigation',
  templateUrl: './challenge-navigation.component.html',
  styleUrls: ['./challenge-navigation.component.scss']
})
export class ChallengeNavigationComponent implements OnInit {
  @Input() challenge;
  @Input() challengeId = this.activatedRoute.snapshot.params.id;
  constructor(private activatedRoute: ActivatedRoute) {}
  ngOnInit() {}
  openEditSettings() {}
}
