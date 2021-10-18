import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  ReviewCriteriaApiService
} from '../../../../services';
import { filter, first } from 'lodash';

import { AppState } from '../../../../store';
import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-idea-questions-container',
  templateUrl: './idea-questions-container.component.html',
  styleUrls: ['./idea-questions-container.component.scss'],
  providers: [ReviewCriteriaApiService]
})
export class IdeaQuestionsContainerComponent implements OnChanges {
  @Input() idea;
  @Input() tags;
  @Input() userOpportunityPermissions;
  @Input() stageAssignees;
  @Input() stageAssignmentSettings;

  seeInstructions = false;
  questionResponses = false;
  hasResponded = false;

  private submit: ElementRef<HTMLElement>;
  private stageEntity;
  public evaluationCriteria;
  public stageScore;
  public opportunityScore;
  public entityTypeOpportunity;
  public followersData;
  public stageStats;

  userResponses = [];

  constructor(
    private reviewCriteriaApi: ReviewCriteriaApiService,
    private entityApi: EntityApiService,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private opportunityApi: OpportunityApiService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'idea': {
            if (this.idea) {
              this.getStageCompletionData();
              this.getOpportunityEntity();
              this.getOpportunityScore();
              this.stageEntity = this.getStageEntity();
              this.getReviewCriteria();
              this.getStageAnalytics();
            }
          }
        }
      }
    }
  }

  getOpportunityEntity() {
    this.entityTypeOpportunity = this.entityApi.getEntity(
      ENTITY_TYPE.OPPORTUNITY_TYPE
    );
  }

  getStageCompletionData() {
    this.opportunityApi
      .getStageCompletionStats(this.idea.id)
      .subscribe((res: any) => {
        this.stageStats = res.response;
      });
  }

  getReviewCriteria() {
    this.reviewCriteriaApi
      .getEvaluationCriteriaData({
        entityObjectId: this.idea.stage.id,
        entityType: this.stageEntity.id,
        community: this.getUserData().currentCommunityId,
        opportunity: this.idea.id
      })
      .subscribe((res: any) => {
        this.evaluationCriteria = res.response;
        if (this.evaluationCriteria.length) {
          const firstCriteria = first(this.evaluationCriteria)
            .evaluationCriteria;
          if (
            firstCriteria.oppEvaluationResponse &&
            firstCriteria.oppEvaluationResponse.length
          ) {
            this.hasResponded = true;
          }
        }
      });
  }

  getOpportunityScore() {
    this.reviewCriteriaApi
      .getOpportunityEvaluationScore({
        opportunity: this.idea.id,
        community: this.getUserData().currentCommunityId
      })
      .subscribe((res: any) => {
        this.opportunityScore = res.response;
      });
  }

  getStageAnalytics() {
    this.reviewCriteriaApi
      .getEvaluationCriteriaScore({
        entityObjectId: this.idea.stage.id,
        entityType: this.stageEntity.id,
        community: this.getUserData().currentCommunityId,
        opportunity: this.idea.id
      })
      .subscribe((res: any) => {
        this.stageScore = res.response;
      });
  }

  private getUserData() {
    return this.ngRedux.getState().userState;
  }

  getStageEntity() {
    return this.entityApi.getEntity(ENTITY_TYPE.STAGE);
  }

  recordUserResponse(response) {
    this.userResponses = filter(
      response,
      (r) => r.criteriaRespData.selected || r.criteriaRespData.selected === 0
    );
  }

  getStageAssignees() {
    this.opportunityApi
      .getCurrentStageAssignees(this.idea.id)
      .subscribe((res: any) => {
        this.stageAssignees = res.response;
      });
  }

  submitResponses() {
    this.reviewCriteriaApi
      .updateEvaluationCriteriaResponses(
        {
          entityObjectId: this.idea.stage.id,
          entityType: this.stageEntity.id,
          community: this.getUserData().currentCommunityId,
          opportunity: this.idea.id
        },
        { data: this.userResponses }
      )
      .subscribe(() => {
        this.notifier.showInfo('Alerts.ResponseRecorded');
        this.questionResponses = !this.questionResponses;
        this.getOpportunityScore();
        this.getStageAnalytics();
        this.getReviewCriteria();
      });
  }
}
