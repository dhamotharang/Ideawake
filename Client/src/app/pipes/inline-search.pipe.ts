import { Pipe, PipeTransform } from '@angular/core';
import { filter, get, lowerCase } from 'lodash';
@Pipe({
  name: 'inLineSearch',
  pure: false
})
export class InLineSearchPipe implements PipeTransform {
  transform(value: any, column?, str?) {
    return filter(value, (object) => {
      const columnText = lowerCase(get(object, column, ''));
      return new RegExp(lowerCase(str)).test(columnText);
    });
  }
}
