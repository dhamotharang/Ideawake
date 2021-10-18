import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  EntityApiService,
  NotificationService,
  OpportunityApiService
} from 'src/app/services';
import { ENTITY_TYPE } from 'src/app/utils';
import { IdeaEvaluationsCriteriaComponent } from '../idea-evaluations-criteria/idea-evaluations-criteria.component';

@Component({
  selector: 'app-idea-evaluations-stage',
  templateUrl: './idea-evaluations-stage.component.html',
  styleUrls: ['./idea-evaluations-stage.component.scss']
})
export class IdeaEvaluationsStageComponent implements OnInit {
  @Output() closePopup = new EventEmitter<any>();
  @Input() idea;

  public stageTypeEntity;
  public evaluationSummary;

  constructor(
    private modalService: NgbModal,
    private entityApiService: EntityApiService,
    private opportunityAPIService: OpportunityApiService,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    this.getStageEntityType();
    this.getOpportunityEvaluationSummaryAPI();
  }

  openIdeaEvalutionsCriteria(stage, totalScore) {
    const modalRef = this.modalService.open(IdeaEvaluationsCriteriaComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.idea = this.idea;
    modalRef.componentInstance.stage = stage;
    modalRef.componentInstance.totalScore = totalScore;
    modalRef.componentInstance.closePopup.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
      }
    });
  }

  getStageEntityType() {
    this.stageTypeEntity = this.entityApiService.getEntity(ENTITY_TYPE.STAGE);
  }

  getOpportunityEvaluationSummaryAPI() {
    const params = {
      entityTypeId: this.stageTypeEntity.id,
      opportunityId: this.idea.id
    };
    this.opportunityAPIService
      .getOpportunityEvaluationSummary(params)
      .subscribe((res: any) => {
        if (res['statusCode'] === 200) {
          this.evaluationSummary = res['response'];
        } else {
          this.notifier.showInfo('Something Went Wrong');
        }
      });
  }

  close() {
    this.closePopup.emit(true);
  }
}
