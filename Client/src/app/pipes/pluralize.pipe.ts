import { Pipe, PipeTransform } from '@angular/core';
import { plural } from 'pluralize';

@Pipe({ name: 'pluralize' })
export class pluralizePipe implements PipeTransform {
  constructor() {}
  transform(value: string) {
    return plural(value);
  }
}
