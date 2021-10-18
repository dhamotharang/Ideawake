import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import {
  ChallengesApiService,
  CommunityApi,
  NotificationService
} from '../../../../services';
import { first, get, cloneDeep } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-edit-challenge-workflow',
  templateUrl: './add-edit-challenge-workflow.component.html',
  styleUrls: ['./add-edit-challenge-workflow.component.scss']
})
export class AddEditChallengeWorkflowComponent implements OnChanges {
  @Input() challenge;
  @Input() modal = false;
  @Output() workflow = new EventEmitter();
  @Output() save = new EventEmitter<void>();
  @Output() updateData = new EventEmitter<void>();
  @Output() switchTab = new EventEmitter<any>();

  public workflowSelected;

  constructor(
    private communityApi: CommunityApi,
    private modalService: NgbModal,
    private challengeApi: ChallengesApiService,
    private notifier: NotificationService
  ) {}

  ngOnChanges() {
    if (
      this.challenge &&
      this.challenge.opportunityType &&
      !get(this.challenge, 'id')
    ) {
      this.communityApi
        .getOpportunityById(this.challenge.opportunityType)
        .subscribe((res: any) => {
          const opportunityType = first(res.response);
          if (opportunityType.workflowId) {
            this.challenge.workflow = opportunityType.workflow;
            this.challenge = { ...this.challenge };
          }
        });
    }
  }

  changeTab(tabId) {
    this.switchTab.emit({ tab: tabId });
  }

  close() {
    this.modalService.dismissAll();
  }

  updateWorkflow() {
    const tempData = cloneDeep(this.challenge);
    tempData.opportunityType = tempData.opportunityType.id;
    tempData.workflow = this.workflowSelected ? this.workflowSelected.id : null;
    this.challengeApi
      .updateChallenge(this.challenge.id, tempData)
      .subscribe(() => {
        this.notifier.showInfo('Updated Successfully!');
        this.updateData.emit(tempData);
        this.close();
      });
  }

  saveDraft() {}
}
