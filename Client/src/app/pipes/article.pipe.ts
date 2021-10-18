import { lowerFirst } from 'lodash';

import { Pipe, PipeTransform } from '@angular/core';

const vowels = { a: '', e: '', i: '', o: '', u: '' };
@Pipe({
  name: 'article',
  pure: true
})
export class ArticlePipe implements PipeTransform {
  transform(value: string, args?: any): string {
    return lowerFirst(value)[0] in vowels ? 'an' : 'a';
  }
}
