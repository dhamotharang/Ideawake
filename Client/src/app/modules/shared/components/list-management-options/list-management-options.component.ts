import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditIdeaFilterComponent } from '../edit-idea-filters/edit-idea-filters.component';
import { PAGE_TYPE_ENUM } from '../../../../utils';
import { EditIdeaColumnComponent } from '../edit-idea-columns/edit-idea-columns.component';
import { RoleAndPermissionsApi } from 'src/app/services';
@Component({
  selector: 'app-list-management-options',
  templateUrl: './list-management-options.component.html',
  styleUrls: ['./list-management-options.component.scss']
})
export class ListManagementOptionsComponent implements OnInit {
  @Input() pageType = PAGE_TYPE_ENUM.card;
  @Output() columnsUpdated = new EventEmitter<any>();
  @Output() filtersUpdated = new EventEmitter<any>();
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;
  public userCommunityPermissions;

  constructor(
    private modalService: NgbModal,
    private roleAndPermissionsApi: RoleAndPermissionsApi
  ) {}

  ngOnInit() {
    this.getCommunityPermissions();
  }

  async getCommunityPermissions() {
    await this.roleAndPermissionsApi
      .getUserPermissionsInCommunity()
      .subscribe((res: any) => {
        this.userCommunityPermissions = res['response'];
      });
  }

  open(content) {
    this.modalService
      .open(content, {
        size: 'lg',
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

  openEditFilters() {
    const modalRef = this.modalService.open(EditIdeaFilterComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.pageType = this.pageType;
    modalRef.componentInstance.filterUpdated.subscribe((value) => {
      this.filtersUpdated.emit(value);
    });
    modalRef.componentInstance.closed.subscribe((closed) => {
      modalRef.close();
    });
  }

  openEditColumns() {
    const modalRef = this.modalService.open(EditIdeaColumnComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.pageType = this.pageType;
    modalRef.componentInstance.columnUpdated.subscribe((value) => {
      this.columnsUpdated.emit(value);
    });
    modalRef.componentInstance.closed.subscribe((closed) => {
      modalRef.close();
    });
  }

  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }
}
