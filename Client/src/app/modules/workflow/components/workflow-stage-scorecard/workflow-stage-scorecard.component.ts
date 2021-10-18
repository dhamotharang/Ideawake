import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { WorkflowApiService } from '../../../../services';
import { AppState } from '../../../../store';
import { AddCriteriaComponent } from '../../../reviews/components/add-criteria/add-criteria.component';

@Component({
  selector: 'app-workflow-stage-scorecard',
  templateUrl: './workflow-stage-scorecard.component.html',
  styleUrls: ['./workflow-stage-scorecard.component.scss']
})
export class WorkflowStageScorecardComponent implements OnInit, OnDestroy {
  @Output() criteriaSelected = new EventEmitter<any>();
  constructor(
    private modalService: NgbModal,
    private workflowApiService: WorkflowApiService,
    private activatedRoute: ActivatedRoute,
    private ngRedux: NgRedux<AppState>
  ) {}
  reload = false;
  selections = [];
  stageId = this.activatedRoute.snapshot.params.stageId;
  entities = this.ngRedux.getState().entitiesState.entities;
  ngOnInit() {
    if (this.stageId) {
      this.getStageEvaluationCriteria();
    }
  }

  getStageEvaluationCriteria() {
    const params = {
      entityObjectId: this.stageId,
      entityType: _.find(this.entities, ['abbreviation', 'stage']).id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    this.workflowApiService
      .getStageEvaluationCriteria(params)
      .subscribe((res: any) => {
        this.selections = _.map(res.response, (value) => {
          const tempObject = value.evaluationCriteria;
          tempObject.order = value.order;
          return tempObject;
        });
        this.emitValues();
      });
  }

  selectedQuestions(event) {
    this.selections = _.map(_.cloneDeep(event), (value, key) => {
      value.order = key + 1;
      return value;
    });
    this.emitValues();
  }

  emitValues() {
    const tempArray = _.map(this.selections, (value) => {
      return { evaluationCriteria: value.id, order: value.order };
    });
    this.criteriaSelected.emit(tempArray);
  }

  reloadSearch(event) {
    this.reload = event;
    setTimeout(() => {
      this.reload = false;
    }, 500);
  }

  public addNewCriteria() {
    const modalRef = this.modalService.open(AddCriteriaComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
    modalRef.componentInstance.selected = this.selections;
    modalRef.componentInstance.closePopup.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
      }
    });
    modalRef.componentInstance.data.subscribe((result) => {
      if (result) {
        this.reload = _.get(result, 'value.id', true);
        setTimeout(() => {
          this.reload = false;
        }, 500);
        modalRef.close('save');
      }
    });
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }
}
