import { Component, OnInit } from '@angular/core';
import { CommunityApi } from '../../../../services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommunityAddNewComponent } from '../community-add-new/community-add-new.component';

@Component({
  selector: 'app-manage-communities',
  templateUrl: './manage-communities.component.html',
  styleUrls: ['./manage-communities.component.scss']
})
export class ManageCommunitiesComponent implements OnInit {
  communities;
  constructor(
    private communityApi: CommunityApi,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.getAllCommunities();
  }

  getAllCommunities() {
    this.communityApi.getUserCommunities().subscribe((res: any) => {
      this.communities = res.response;
    });
  }

  openAddNewCommunityModal() {
    const modal = this.modalService.open(CommunityAddNewComponent, {
      size: 'lg'
    });
    modal.componentInstance.modal = modal;
    modal.componentInstance.newCommunity.subscribe((community) => {
      this.communities.push(community);
      modal.close();
    });
  }
}
