import { AppState, creator } from '../../../../store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { findIndex, forEach } from 'lodash';

import { CarouselComponent } from '../carousel/carousel.component';
import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadContentComponent } from '../../../uploads/components';
import { UtilService } from '../../../../services';

@Component({
  selector: 'app-media-feature',
  templateUrl: './media-feature.component.html',
  styleUrls: ['./media-feature.component.scss']
})
export class MediaFeatureComponent implements OnChanges {
  closeResult: string;
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() files;
  @Input() from;
  @Input() openModal = true;
  @Input() userOpportunityPermissions;

  @Output() update = new EventEmitter<void>();
  @Output() selectedImageIndex = new EventEmitter<number>();

  allFiles;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private util: UtilService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'files':
            if (this.files) {
              forEach(this.files, (file) => {
                file.icon = this.util.getFileIcon(file);
              });

              this.allFiles = this.files;
            }
            break;
        }
      }
    }
  }

  openCarousel(id) {
    const modalRef = this.modalService.open(CarouselComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.files = this.allFiles;
    modalRef.componentInstance.loadedImage = id;
  }

  removeFile(file) {
    const index = findIndex(this.allFiles, ['id', file.id]);
    if (index !== -1) {
      this.allFiles.splice(index, 1);
      this.update.emit();
    }
  }

  selectImage(index) {
    this.selectedImageIndex.emit(index);
  }

  downloadFile(file) {
    this.util.downloadFile(file);
  }

  openUploadContent() {
    const modalRef = this.modalService.open(UploadContentComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.from = this.from;
    modalRef.componentInstance.update.subscribe(() => this.update.emit());
    this.ngRedux.dispatch({
      type: creator(this.from),
      selected: this.files
    });
  }
}
