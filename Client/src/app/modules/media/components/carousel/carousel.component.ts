import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbCarousel } from '@ng-bootstrap/ng-bootstrap';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilService } from '../../../../services';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements AfterViewInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() files;
  @Input() loadedImage;
  @ViewChild('carousel', { static: false }) carousel: NgbCarousel;

  constructor(
    public modal: NgbActiveModal,
    public sanitizer: DomSanitizer,
    private util: UtilService
  ) {}

  ngAfterViewInit() {
    this.carousel.pause();
    setTimeout(() => this.carousel.select(this.loadedImage), 0);
  }

  viewFile(file) {
    this.util.openFile(file);
  }

  downloadFile(file) {
    this.util.downloadFile(file);
  }

  selectImage(index) {
    this.carousel.select(index);
  }
}
