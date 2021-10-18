import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService, NotificationService } from '../../../../services';
import { ConfirmBoxComponent } from '../../../shared/components/confirmBox/confirmBox.component';

@Component({
  selector: 'app-widget-manage',
  templateUrl: './widget-manage.component.html',
  styleUrls: ['./widget-manage.component.scss']
})
export class WidgetManageComponent implements OnInit {
  @Input() id;
  @Input() edit: boolean;
  @Output() editToggle = new EventEmitter<boolean>();
  @Output() removed = new EventEmitter<boolean>();

  constructor(
    private ngbModal: NgbModal,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {}

  toggleEditValue() {
    this.edit = !this.edit;
    this.editToggle.emit(this.edit);
  }

  deleteGadget() {
    if (this.id) {
      const modalRef = this.ngbModal.open(ConfirmBoxComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
      modalRef.componentInstance.header = `You want to delete this gadget?`;
      modalRef.componentInstance.message = ``;
      modalRef.componentInstance.button = `Confirm`;
      modalRef.componentInstance.outPutResult.subscribe(async (result) => {
        if (result.confirm) {
          modalRef.close('confirm');
          await this.dashboardService.deleteWidget(this.id).toPromise();
          this.notificationService.showSuccess(`Successfully Removed.`);
          this.removed.emit(true);
        } else {
          modalRef.close('cancel');
        }
      });
    }
  }
}
