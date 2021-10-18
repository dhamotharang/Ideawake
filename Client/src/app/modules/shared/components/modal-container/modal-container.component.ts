import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MODAL_CONTAINER_CONSTANTS as constants } from '../../../../utils';
import { EditIdeaComponent } from '../../../idea/components';
import { CreateGroupsComponent } from '../create-group-modal/create-groups.component';
import { EditGroupModalComponent } from '../edit-group-modal/edit-group-modal.component';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'app-modal-container',
  template: ''
})
export class ModalContainerComponent implements OnDestroy {
  destroy = new Subject<any>();
  currentDialog = null;

  constructor(
    private modalService: NgbModal,
    route: ActivatedRoute,
    router: Router
  ) {
    route.params.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const refModal = this.getModal(constants[params.id]);

      this.currentDialog = this.modalService.open(refModal);
      this.currentDialog.componentInstance.retdata = params.data;
      this.currentDialog.componentInstance.close1.subscribe(() => {
        this.currentDialog.close();
      });

      // Go back to home page after the modal is closed
      this.currentDialog.result.then(
        (result) => {
          if (!result) {
            router.navigate(['', { outlets: { modal: null } }]);
            setTimeout(() => {
              const currentUrl = router.url;
              router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  router.navigate([currentUrl]);
                });
            }, 100);
          }
        },
        (reason) => {
          if (!reason) {
            router.navigate(['', { outlets: { modal: null } }]);
          }
          // location.back();
        }
      );
    });
  }

  private getModal(component) {
    // When router navigates on this component is takes the params and opens up the photo detail modal
    switch (component) {
      case 'EditGroupModalComponent':
        return EditGroupModalComponent;
      case 'CreateGroupsComponent':
        return CreateGroupsComponent;
      case 'EditProfileModalComponent':
        return EditProfileModalComponent;
      case 'EditIdeaModalComponent':
        return EditIdeaComponent;
    }
  }

  public getModalReference() {
    return this.currentDialog;
  }

  ngOnDestroy() {
    this.destroy.next();
  }
}
