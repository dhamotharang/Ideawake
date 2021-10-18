import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ACTION_ITEM_ABBREVIATIONS } from 'src/app/utils';

@Component({
  selector: 'app-idea-pipeline-feed',
  templateUrl: './idea-pipeline-feed.component.html',
  styleUrls: ['./idea-pipeline-feed.component.scss']
})
export class IdeaPipelineFeedComponent implements OnInit {
  @Input() opportunity;
  @Input() stage;

  @Output() openSummaryModal = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  actionItems = ACTION_ITEM_ABBREVIATIONS;
  round = Math.round;
  showManageOptions = false;

  constructor() {}

  ngOnInit() {}
}
