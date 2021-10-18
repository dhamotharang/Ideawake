import * as _ from 'lodash';
import { MENTION_TYPES } from '../../../../utils';
import { SharedApi } from '../../../../services';

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-mentionable-area',
  templateUrl: './mentionable-area.component.html',
  styleUrls: ['./mentionable-area.component.scss'],
  providers: [SharedApi]
})
export class MentionableTextareaComponent implements OnChanges, AfterViewInit {
  @Input() rows = '5';
  @Input() placeholder;
  @Input() maxLength = 1000;
  @Input() groups;
  @Input() tags;
  @Input() users;
  @Input() preMention;
  @Input() element = 'textarea';
  @Input() data = '';

  @Output() getText = new EventEmitter<any>();
  @Output() searchTerm = new EventEmitter<any>();
  @Output() selectedMention = new EventEmitter<any>();
  @Output() selectedTag = new EventEmitter<any>();

  @ViewChild('ngMentionId', { static: false }) ngMentionId;
  public config = {
    mentions: [
      {
        items: [],
        data: [],
        triggerChar: '@',
        mentionSelect: (userName) => {
          const tempObject = this.config.mentions[0].data[
            this.config.mentions[0].data.findIndex((el) =>
              el.userName
                ? el.userName === userName.label
                : el.name === userName.label
            )
          ];
          let finalObject = {
            title: '',
            mentionedObjectId: '',
            mentionedObjectType: ''
          };
          if (tempObject.email) {
            finalObject.title = tempObject.firstName + tempObject.lastName;
            finalObject.mentionedObjectId = tempObject.id;
            finalObject.mentionedObjectType = 'user';
          } else {
            finalObject.title = tempObject.name;
            finalObject.mentionedObjectId = tempObject.id;
            finalObject.mentionedObjectType = 'group';
          }
          const finalObjectCopy = _.cloneDeep(finalObject);
          this.selectedMention.emit(finalObjectCopy);
          return '@' + userName.label + ' ';
        }
      },
      {
        items: [],
        data: [],
        triggerChar: '#',
        mentionSelect: (tag) => {
          this.selectedTag.emit(
            this.config.mentions[1].data[
              this.config.mentions[1].data.findIndex(
                (el) => el.name === tag.label
              )
            ].id
          );
          return '#' + tag.label + ' ';
        }
      }
    ]
  };

  constructor(private sharedApi: SharedApi) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      !_.first(this.config.mentions).items ||
      !_.first(this.config.mentions).items.length
    ) {
      this.mentionConfig();
    }

    if (changes.tags) {
      this.tagConfig();
    }

    if (this.preMention) {
      this.defaultMention(this.preMention);
    }
  }

  mentionConfig() {
    const usersItems = _.map(this.users, (user) => {
      user.mentionType = MENTION_TYPES.USER;
      return user;
    });
    const groupsItems = _.map(this.groups, (group) => {
      group.mentionType = MENTION_TYPES.GROUP;
      return group;
    });
    const tagsItems = _.map(this.tags, 'name');
    _.first(this.config.mentions).items = [
      ..._.map(usersItems, 'userName'),
      ..._.map(groupsItems, 'name')
    ];
    _.first(this.config.mentions).data = [...usersItems, ...groupsItems];
    _.last(this.config.mentions).items = tagsItems;
    _.last(this.config.mentions).data = this.tags;
    this.config = { ...this.config };
  }

  tagConfig() {
    const tagsItems = _.map(this.tags, 'name');
    _.last(this.config.mentions).items = tagsItems;
    _.last(this.config.mentions).data = this.tags;
    this.config = { ...this.config };
  }

  ngAfterViewInit() {
    this.ngMentionId.nativeElement[
      this.element === 'textarea' ? 'innerText' : 'value'
    ] = this.data;
  }

  defaultMention(tempObject) {
    let finalObject = {
      title: '',
      mentionedObjectId: '',
      mentionedObjectType: ''
    };
    if (tempObject.email) {
      finalObject.title = tempObject.firstName + tempObject.lastName;
      finalObject.mentionedObjectId = tempObject.id;
      finalObject.mentionedObjectType = 'user';
    } else {
      finalObject.title = tempObject.name;
      finalObject.mentionedObjectId = tempObject.id;
      finalObject.mentionedObjectType = 'group';
    }
    const finalObjectCopy = _.cloneDeep(finalObject);
    this.selectedMention.emit(finalObjectCopy);
    this.ngMentionId.nativeElement.value += '@' + finalObject.title + ' ';
    this.emitText();
  }

  search(term) {
    const search = this.ngMentionId.nativeElement.value.startsWith('#')
      ? 'tags'
      : 'mention';
    if (search === 'tags') {
      this.config.mentions[1].items = [];
      this.config.mentions[1].data = [];
      this.sharedApi.searchTags(term).subscribe((res1: any) => {
        res1.response.forEach((tag) => {
          this.config.mentions[1].items.push(tag.name);
          this.config.mentions[1].data.push(tag);
        });
        this.config = { ...this.config };
      });
    }
  }

  emitText() {
    this.getText.emit(this.ngMentionId.nativeElement.value);
  }
}
