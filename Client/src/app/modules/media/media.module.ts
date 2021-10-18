import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CarouselComponent,
  ColorPickerComponent,
  MediaFeatureComponent,
  ColorSelectComponent,
  SocialImagesComponent,
  EngagementModalComponent
} from './components';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { SocialActivityModule } from '../social-activity/social-activity.module';

@NgModule({
  declarations: [
    CarouselComponent,
    ColorPickerComponent,
    ColorSelectComponent,
    MediaFeatureComponent,
    SocialImagesComponent,
    EngagementModalComponent
  ],
  imports: [
    CommonModule,
    LazyLoadImageModule,
    NgbModalModule,
    FontAwesomeModule,
    NgbModule,
    RouterModule,
    SocialActivityModule
  ],
  entryComponents: [CarouselComponent, EngagementModalComponent],
  exports: [
    CarouselComponent,
    ColorPickerComponent,
    ColorSelectComponent,
    MediaFeatureComponent,
    SocialImagesComponent,
    EngagementModalComponent
  ]
})
export class MediaModule {}
