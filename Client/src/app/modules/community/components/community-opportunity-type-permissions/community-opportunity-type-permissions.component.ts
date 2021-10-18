import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';

import { CommunityApi } from '../../../../services';

@Component({
  selector: 'app-community-opportunity-type-permissions',
  templateUrl: './community-opportunity-type-permissions.component.html',
  styleUrls: ['./community-opportunity-type-permissions.component.scss']
})
export class CommunityOpportunityTypePermissionsComponent implements OnChanges {
  @Input() opportunityId;
  @Output() settings = new EventEmitter();

  visibilityAndPermissionSettings: any = {};

  constructor(private communityApi: CommunityApi) {}

  ngOnChanges() {
    if (this.opportunityId) {
      this.getVisibilityAndPermissions();
    }
  }

  getVisibilityAndPermissions() {
    this.communityApi
      .getOpportunityVisibilityAndPermissionSettings(this.opportunityId)
      .subscribe((res: any) => {
        this.visibilityAndPermissionSettings = res.response;
        this.settings.emit(this.visibilityAndPermissionSettings);
      });
  }
}
