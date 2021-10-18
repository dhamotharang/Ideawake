import {
  UploadContentComponent,
  UploadContentOptionsComponent,
  UploadSingleFileComponent,
  UploadedContentComponent
} from './components';

import { ApplicationPipesModule } from '../search/pipes.module';
import { CommonModule } from '@angular/common';
import { DragDropDirective } from '../../directives';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgModule } from '@angular/core';
import { UploadApiService } from '../../services';
import { I18nModule } from '../i18n/i18n.module';

@NgModule({
  declarations: [
    UploadContentComponent,
    UploadContentOptionsComponent,
    UploadedContentComponent,
    UploadSingleFileComponent,
    DragDropDirective
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ApplicationPipesModule,
    LazyLoadImageModule,
    I18nModule
  ],
  exports: [
    UploadContentComponent,
    UploadContentOptionsComponent,
    UploadedContentComponent,
    UploadSingleFileComponent
  ],
  entryComponents: [UploadContentComponent, UploadSingleFileComponent],
  providers: [UploadApiService]
})
export class UploadsModule {}
