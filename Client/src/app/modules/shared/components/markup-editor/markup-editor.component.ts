import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { EMAIL_BOOKMARKS } from '../../../../utils';
@Component({
  selector: 'app-markup-editor',
  templateUrl: './markup-editor.component.html',
  styleUrls: ['./markup-editor.component.scss']
})
export class MarkupEditorComponent implements OnInit, OnChanges {
  @Output() selectedValue = new EventEmitter();
  @Input() text = null;
  @Input() bookMarks = EMAIL_BOOKMARKS.default;
  @Input() height = 500;
  @Output() outputText = new EventEmitter();
  tinyMceConfig: any;
  constructor() {}

  selectBookMark(value) {
    this.selectedValue.emit(value);
  }

  ngOnInit() {
    this.configureTinyMce();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'bookMarks':
            this.configureTinyMce();
            break;
          default:
            break;
        }
      }
    }
  }

  configureTinyMce() {
    this.tinyMceConfig = {
      height: this.height,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
      ],
      toolbar:
        'undo redo | customDropdown | formatselect | bold italic backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat',
      setup: (editor) => {
        editor.ui.registry.addMenuButton('customDropdown', {
          text: 'Personalize',
          fetch: (callback) => {
            const items = [];
            for (const bm of this.bookMarks) {
              items.push({
                type: 'menuitem',
                text: bm.value,
                onAction: () => {
                  editor.insertContent(`&nbsp;${bm.key}&nbsp;`);
                }
              });
            }
            /* const items = [
              {
                type: 'menuitem',
                text: 'First Name',
                onAction: () => {
                  editor.insertContent('&nbsp;{{firstName}}&nbsp;');
                }
              },
              {
                type: 'menuitem',
                text: 'Opportunity Number',
                onAction: () => {
                  editor.insertContent('&nbsp;{{opportunityNumber}}&nbsp;');
                }
              },
              {
                type: 'menuitem',
                text: 'Opportunity Title',
                onAction: () => {
                  editor.insertContent('&nbsp;{{opportunityTitle}}&nbsp;');
                }
              },
              {
                type: 'menuitem',
                text: 'Opportunity Description',
                onAction: () => {
                  editor.insertContent(
                    '&nbsp;{{opportunityDescription}}&nbsp;'
                  );
                }
              }
            ]; */
            callback(items);
          }
        });
      }
    };
  }

  textUpdate() {
    this.outputText.emit(this.text);
  }
}
