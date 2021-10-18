import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {
  @Input() defaultColors: string[] = [
    '#1ab394',
    '#ffffff',
    '#000105',
    '#3e6158',
    '#3f7a89',
    '#96c582',
    '#b7d5c4',
    '#bcd6e7',
    '#7c90c1',
    '#9d8594',
    '#dad0d8',
    '#4b4fce',
    '#4e0a77',
    '#a367b5',
    '#ee3e6d',
    '#d63d62',
    '#c6a670',
    '#f46600',
    '#cf0500',
    '#efabbd',
    '#8e0622',
    '#f0ca68',
    '#62382f',
    '#c97545',
    '#c1800b'
  ];
  @Input() heading: string;
  @Input() color: string;
  @Input() canEdit = true;
  @Output() selected = new EventEmitter();

  public show = false;

  constructor() {}

  ngOnInit() {}

  /* Change status of visibility to color picker */
  public toggleColors() {
    if (!this.canEdit) {
      this.show = false;
      return false;
    }
    this.show = !this.show;
  }

  /* Change color from default colors */
  public changeColor(color: string) {
    this.color = color;
    this.selected.emit(this.color); // Return color
    this.show = false;
  }

  /* Change color from input */
  public changeColorManual(color: string) {
    const isValid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);

    if (isValid) {
      this.color = color;
      this.selected.emit(this.color); // Return color
    }
  }
}
