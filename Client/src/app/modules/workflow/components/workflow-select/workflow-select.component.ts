import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import { WorkflowApiService } from '../../../../services';
import { find, get } from 'lodash';
import { of, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-workflow-select',
  templateUrl: './workflow-select.component.html',
  styleUrls: ['./workflow-select.component.scss']
})
export class WorkflowSelectComponent implements OnInit, OnChanges {
  @Input() entity;
  @Output() workflow = new EventEmitter();

  private workflowsSubscriber = new BehaviorSubject([]);
  workflows$ = this.workflowsSubscriber.asObservable();
  workflowSelected;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private workflowApiService: WorkflowApiService
  ) {}

  ngOnInit() {
    this.getCommunityWorkFlows();
  }

  ngOnChanges() {
    const workflow = get(this.entity, 'workflow', null);
    if (workflow) {
      this.workflows$.subscribe((workflows) => {
        this.workflowSelected = find(workflows, ['id', workflow.id]);
        this.workflow.emit(this.workflowSelected);
      });
    }
  }

  getCommunityWorkFlows() {
    this.workflowApiService
      .getAllCommunityWorkflows({
        community: this.ngRedux.getState().userState.currentCommunityId,
        isDeleted: false
      })
      .subscribe((res) => {
        this.workflowsSubscriber.next(get(res, 'response', []));
      });
  }

  selectWorkflow(workflow) {
    this.workflowSelected = workflow;
    this.workflow.emit(this.workflowSelected);
  }
}
