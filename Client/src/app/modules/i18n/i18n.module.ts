import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DynamicTranslationPipe } from '../../pipes';

import { I18nPipe } from './i18n.pipe';
import { I18nService } from './i18n.service';

@NgModule({
  declarations: [I18nPipe, DynamicTranslationPipe],
  imports: [CommonModule],
  providers: [I18nService, AsyncPipe],
  exports: [I18nPipe, DynamicTranslationPipe]
})
export class I18nModule {}
