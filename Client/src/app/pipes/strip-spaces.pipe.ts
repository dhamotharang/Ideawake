import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceSpacesWith' })
export class StripSpaces implements PipeTransform {
  transform(str: string, args: any): any {
    return str.replace(/ /g, args[0]);
  }
}
