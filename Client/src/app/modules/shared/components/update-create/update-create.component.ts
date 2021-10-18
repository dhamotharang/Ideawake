import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LOAD_UPDATE_AUDIENCE } from 'src/app/actions';
import { AppState, INITIAL_UPDATE_AUDIENCE } from 'src/app/store';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-update-create',
  templateUrl: './update-create.component.html',
  styleUrls: ['./update-create.component.scss']
})
export class UpdateCreateComponent implements OnInit {
  closeResult: string;
  targeting = cloneDeep(INITIAL_UPDATE_AUDIENCE.targeting);
  @Input() inNavigation = false;
  @Input() inView = false;
  @Input() level = 'community';
  @Input() entityObjectId;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private router: Router
  ) {}

  ngOnInit() {}

  open(content) {
    if (!this.router.url.includes('/community/post-update')) {
      this.modalService
        .open(content, {
          windowClass: 'outcomes-modal',
          ariaLabelledBy: 'modal-basic-title',
          beforeDismiss: this.beforeDismiss
        })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
    }
  }

  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  navigate() {
    this.ngRedux.dispatch({
      type: LOAD_UPDATE_AUDIENCE,
      targeting: cloneDeep(this.targeting)
    });
    this.targeting = cloneDeep(INITIAL_UPDATE_AUDIENCE.targeting);
    if (this.level == 'community') {
      this.router.navigateByUrl('/community/post-update');
    } else if (this.level == 'challenge') {
      this.router.navigate(['/challenges/post-update/', this.entityObjectId]);
    }
  }

  updateAssigneeSettings(event) {
    this.targeting = event;
  }

  dismissModal() {
    this.targeting = cloneDeep(INITIAL_UPDATE_AUDIENCE.targeting);
    this.modalService.dismissAll();
  }
}
