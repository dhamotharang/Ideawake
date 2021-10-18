import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { find, maxBy, groupBy, get, filter } from 'lodash';
import {
  EntityApiService,
  NotificationService,
  OpportunityApiService
} from 'src/app/services';
import { DEFAULT_PRELOADED_IMAGE, ENTITY_TYPE } from 'src/app/utils';

@Component({
  selector: 'app-idea-evaluations-criteria',
  templateUrl: './idea-evaluations-criteria.component.html',
  styleUrls: ['./idea-evaluations-criteria.component.scss']
})
export class IdeaEvaluationsCriteriaComponent implements OnInit {
  @Output() closePopup = new EventEmitter<any>();
  @Input() stage;
  @Input() idea;
  @Input() totalScore;
  isScrolling = true;

  public stageTypeEntity;
  public criteraSummary;
  public toggleChoice = 'Scores';
  public stageCriteriasResponses = [];
  public criterias;
  public users = [];
  public defaultImage = DEFAULT_PRELOADED_IMAGE;
  public count = 0;
  public totalCount;
  public image = 'https://via.placeholder.com/30x30';

  constructor(
    private opportunityAPIService: OpportunityApiService,
    private entityApiService: EntityApiService,
    private notifier: NotificationService,
    private decimalPipe: DecimalPipe
  ) {}

  ngOnInit() {
    this.getStageEntityType();
    this.getOpportunityCriteriaSummaryAPI();
    this.getOpportunityScoreResponseAPI();
  }

  close() {
    this.closePopup.emit(true);
  }

  onClickToggleChoice(choice) {
    this.toggleChoice = choice;
  }

  getStageEntityType() {
    this.stageTypeEntity = this.entityApiService.getEntity(ENTITY_TYPE.STAGE);
  }

  changePage() {
    if (this.isScrolling) {
      this.isScrolling = false;
      if (this.count >= this.totalCount) {
        return false;
      }
      this.getOpportunityScoreResponseAPI();
    }
  }

  getOpportunityScoreResponseAPI() {
    const params = {
      entityObjectId: this.stage.id,
      entityType: this.stageTypeEntity.id,
      opportunity: this.idea.id,
      take: 10,
      skip: this.count
    };

    this.opportunityAPIService
      .getOpportunityScoreResponse(params)
      .subscribe((res: any) => {
        if (res['statusCode'] === 200) {
          res['response']['responses'].forEach((element) => {
            this.stageCriteriasResponses.push(element);
          });
          res['response']['userScores'].forEach((element) => {
            this.users.push(element);
          });
          if (!this.criterias) {
            this.criterias = res['response'].integCriteria;
          }
          this.count = this.users.length || 0;
          this.totalCount = res['response'].totalRespondents;
        } else {
          this.notifier.showInfo('Something Went Wrong');
          this.isScrolling = true;
        }
      });
  }

  getOpportunityCriteriaSummaryAPI() {
    const params = {
      entityObjectId: this.stage.id,
      entityTypeId: this.stageTypeEntity.id,
      opportunityId: this.idea.id
    };
    this.opportunityAPIService
      .getOpportunityCriteriaSummary(params)
      .subscribe((res: any) => {
        if (res['statusCode'] === 200) {
          this.criteraSummary = res['response'];
        } else {
          this.notifier.showInfo('Something Went Wrong');
        }
      });
  }

  getSummaryValue(criteria, choice) {
    const summary = find(this.criteraSummary, ['criteriaId', criteria.id]);
    if (summary && choice == 'average') {
      if (criteria.evaluationType.abbreviation == 'question') {
        if (this.toggleChoice == 'Responses') {
          const mostFrequent = maxBy(
            Object.values(
              groupBy(
                filter(this.stageCriteriasResponses, {
                  evaluationCriteriaId: criteria.id
                }),
                (el) => el.selectedResponse
              )
            ),
            (arr) => arr.length
          );
          if (mostFrequent) {
            return mostFrequent[0].selectedResponse;
          }
        }
        return summary.avgNormalizedScore
          ? this.decimalPipe.transform(summary.avgNormalizedScore, '1.0-2') +
              '/10'
          : '-';
      } else if (criteria.evaluationType.abbreviation == 'numerical_range') {
        const unit = get(criteria.criteriaObject, 'unit', '');
        return summary.avgScore
          ? unit + this.decimalPipe.transform(summary.avgScore, '1.0-2')
          : '-';
      }
    } else if (summary && choice == 'variance') {
      return summary.variance
        ? this.decimalPipe.transform(summary.variance, '1.0-2')
        : '-';
    }
    return '-';
  }

  getUserScore(user, criteria) {
    const response = find(this.stageCriteriasResponses, {
      evaluationCriteriaId: criteria.id,
      userId: user.id
    });
    if (response) {
      if (
        response.evaluationCriteria.evaluationType.abbreviation ==
        'numerical_range'
      ) {
        const unit = get(
          response.evaluationCriteria.criteriaObject,
          'unit',
          ''
        );
        const value = this.decimalPipe.transform(
          response.selectedResponse,
          '1.0-2'
        );
        return unit + value;
      } else {
        if (this.toggleChoice == 'Scores') {
          return (
            this.decimalPipe.transform(response.normalizedScore, '1.0-2') +
            '/10'
          );
        } else if (this.toggleChoice == 'Responses') {
          return response.selectedResponse;
        }
      }
    }
    return '-';
  }
}
