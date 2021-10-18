import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-comment-reply',
  templateUrl: './comment-reply.component.html',
  styleUrls: ['./comment-reply.component.scss']
})
export class CommentReplyComponent implements OnInit {
  @ViewChild('text', { static: false }) text;
  constructor() {}

  ngOnInit() {}
}
