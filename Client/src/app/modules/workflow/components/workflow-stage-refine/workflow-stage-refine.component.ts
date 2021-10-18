import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, get, find } from 'lodash';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import { CustomFieldApiService } from '../../../../services';
@Component({
  selector: 'app-workflow-stage-refine',
  templateUrl: './workflow-stage-refine.component.html',
  styleUrls: ['./workflow-stage-refine.component.scss']
})
export class WorkflowStageRefineComponent implements OnInit {
  @Input() selectedFields = [];
  @Output() output = new EventEmitter<any>();
  stageId = this.activatedRoute.snapshot.params.stageId;
  entities = this.ngRedux.getState().entitiesState.entities;
  selectedCustomFields = [];
  fieldsList = [];
  updateList = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private customFieldService: CustomFieldApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    if (this.stageId) {
      this.getAttachedFields();
    }
  }

  newFieldCreated(event) {
    this.updateList = get(event, 'field.id', true);
    setTimeout(() => {
      this.updateList = false;
    }, 1000);
  }

  getAttachedFields() {
    const params = {
      entityObjectId: this.stageId,
      entityType: find(this.entities, ['abbreviation', 'stage']).id,
      community: this.ngRedux.getState().userState.currentCommunityId,
      visibilityExperience: 'refinement_tab'
    };
    this.customFieldService.getAttachedFields(params).subscribe((res: any) => {
      this.selectedCustomFields = map(res.response, (attached) => ({
        ...attached.field,
        order: get(attached, 'order')
      }));
      this.fieldsList = map(res.response, (attached) => ({
        field: get(attached, 'field.id'),
        order: get(attached, 'order'),
        visibilityExperience: get(attached, 'visibilityExperience')
      }));
      this.output.emit(this.fieldsList);
    });
  }

  mapOpportunityTypeFields(fields) {
    this.fieldsList = map(fields, (field) => ({
      field: field.id,
      order: field.order,
      visibilityExperience: 'refinement_tab'
    }));
    this.output.emit(this.fieldsList);
  }
}
