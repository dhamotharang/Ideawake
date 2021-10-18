import { Injectable, PipeTransform } from '@nestjs/common';

//TODO: Update the basic level of sanitization with the following abilities
/**
 * 1. Able to exclude safe list chracter.
 * 2. Able to sanitizie string value in multi-diamansional Object/Array.
 */
@Injectable()
export class SanitizeStringPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/[^\w\s]/gi, '');
  }
}
