import { Pipe, PipeTransform } from '@angular/core';

import { I18nService } from './i18n.service';

@Pipe({
  name: 'translationPipe',
  pure: true
})
export class I18nPipe implements PipeTransform {
  constructor(public i18nService: I18nService) {}

  transform(language: any, args?: any) {
    return this.i18nService.getTranslation(language);
  }
}
