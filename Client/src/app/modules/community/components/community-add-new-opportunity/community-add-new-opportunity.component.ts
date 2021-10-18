import { capitalize } from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CommunityApi, NotificationService } from '../../../../services';

@Component({
  selector: 'app-community-add-new-opportunity',
  templateUrl: './community-add-new-opportunity.component.html',
  styleUrls: ['./community-add-new-opportunity.component.scss']
})
export class CommunityAddNewOpportunityComponent implements OnInit {
  opportunity;
  descriptionVisibility;
  selectedIcon;
  hideError;
  isDisabled = false;

  toCapital;

  @Input() linkableTypes: any;
  @Output() newAddition = new EventEmitter();

  constructor(
    public modal: NgbActiveModal,
    private communityApi: CommunityApi,
    private notifier: NotificationService
  ) {
    this.opportunity = {
      name: '',
      description: '',
      color: '#1AB394',
      icon: 'lightbulb'
    };
    this.descriptionVisibility = false;
    this.selectedIcon = this.opportunity.icon;
    this.hideError = true;
    this.toCapital = capitalize;
  }

  ngOnInit() {}

  addOpportunity() {
    if (this.opportunity.name === '') {
      this.hideError = false;
      return;
    }
    this.isDisabled = true;
    this.opportunity.linkableTypes = this.linkableTypes.map((val) => val.id);

    this.communityApi.addNewOpportunity(this.opportunity).subscribe(
      (res: any) => {
        this.newAddition.emit(res.response);
        this.isDisabled = false;
        this.modal.close();
        this.notifier.showSuccess('Alerts.OpportunityTypeCreatedSuccess');
      },
      (err) => {
        this.isDisabled = false;
        if (err.error.statusCode == 409) {
          this.notifier.showError('Alerts.OpportunityTypeNameExists');
          return;
        }
        this.notifier.showError('Alerts.SomethingWrong');
      }
    );
  }
}
