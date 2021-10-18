import {
  cloneDeep,
  first,
  get,
  isEmpty,
  find,
  map,
  merge,
  concat,
  uniqBy,
  forEach
} from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  UtilService
} from '../../../../services';
import { AppState } from '../../../../store';
import { ENTITY_TYPE, MANAGE_ACTIONS } from '../../../../utils';
import {
  EditIdeaComponent,
  IdeaFiltersComponent,
  PostIdeaComponent
} from '../../../idea/components';
import { IdeaSummaryComponent } from '../../../idea/components/idea-summary/idea-summary.component';
import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from 'src/app/modules/workflow/components';
import { ArchiveIdeaModalComponent } from 'src/app/modules/idea/components/archive-idea-modal/archive-idea-modal.component';

@Component({
  selector: 'app-challenge-ideas-list',
  templateUrl: './challenge-ideas-list.component.html',
  styleUrls: ['./challenge-ideas-list.component.scss']
})
export class ChallengeIdeasListComponent implements OnInit, OnChanges {
  @ViewChild(forwardRef(() => IdeaFiltersComponent), { static: false })
  private filters: IdeaFiltersComponent;
  @Input() challengeId = this.activatedRoute.snapshot.params.id;
  @Input() challenge;
  @Input() userChallengePermissions;
  @Input() permissionsData;

  public scrollDownDistance = 2;
  public currentUser = this.ngRedux.getState().userState;
  public permission = true;
  public isSearching = true;
  public notPosted = false;
  public isFilter = false;
  public ideaEntity;
  public appliedFilters;
  public ideas = [];
  public upvotes = [];
  public upvoteCount;
  public upvoteDetail;
  public tagsData;
  public followersData;
  public commentCounts;
  public topScores;
  public article;
  public currentCount = 0;
  public count = 0;
  public searchParams: any;
  defaultPage = {
    take: 10,
    skip: 0
  };

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private opportunityApiService: OpportunityApiService,
    private entityService: EntityApiService,
    private activatedRoute: ActivatedRoute,
    private permissionsApi: RoleAndPermissionsApi,
    private notifier: NotificationService,
    private util: UtilService,
    private router: Router,
    private roleAndPermissionsApi: RoleAndPermissionsApi
  ) {}

  ngOnInit() {
    this.activatedRoute.params.forEach((params: any) => {
      this.challengeId = params.id;
      this.isSearching = true;
      const queryParams = this.activatedRoute.snapshot.queryParams;
      let parameters: any = {};
      if (queryParams.sideFilter) {
        this.isFilter = true;
        this.appliedFilters = JSON.parse(queryParams.sideFilter);
        parameters = cloneDeep(this.appliedFilters);
        parameters.workflow = get(parameters.workflow, 'id');
        parameters.stage = get(parameters.stage, 'id');
        parameters.statuses = map(parameters.statuses, 'id');
        parameters.opportunityTypes = map(parameters.opportunityTypes, 'id');
        parameters.tags = map(parameters.tags, 'id');
      }
      this.searchParams = { ...parameters, ...this.defaultPage };
      this.currentCount = 0;
      this.getOpportunities(this.searchParams);
    });
  }

  ngOnChanges() {}

  openPostIdea() {
    const modalRef = this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.challengeRedirect = false;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.postedIdeaId.subscribe((res) => {
      this.getOpportunities();
    });
  }

  filterOpportunities(event) {
    if (isEmpty(event.tags)) {
      delete event.tags;
    }
    if (isEmpty(event.opportunityTypes)) {
      delete event.opportunityTypes;
    }
    this.appliedFilters = cloneDeep(event);
    this.util.navigateTo({ sideFilter: JSON.stringify(event) });
    this.isFilter = true;
    const params = cloneDeep(event);
    params.workflow = get(params.workflow, 'id');
    params.stage = get(params.stage, 'id');
    params.statuses = map(params.statuses, 'id');
    params.opportunityTypes = map(params.opportunityTypes, 'id');
    params.tags = map(params.tags, 'id');
    this.searchParams = { ...params, ...this.defaultPage };
    this.currentCount = 0;
    this.getOpportunities(this.searchParams);
  }

  changePage() {
    if (this.currentCount >= this.count) {
      return false;
    }
    const page = { take: 8, skip: this.currentCount };
    this.searchParams = { ...this.searchParams, ...page };
    this.getOpportunities(this.searchParams, true);
  }

  async getOpportunities(params?, joinData = false) {
    this.ideaEntity = this.entityService.getEntity(ENTITY_TYPE.IDEA);
    const queryParams = {
      ...params,
      ...{
        isDeleted: false,
        draft: false,
        community: this.currentUser.currentCommunityId,
        challenge: this.challengeId
      }
    };
    const ideasDetail = await this.opportunityApiService
      .getOpportunityOld(queryParams)
      .toPromise()
      .then((response: any) => {
        const res = this.extractData(response, joinData);
        res.data.forEach((row) => {
          row.entityObject = {
            community: this.currentUser.currentCommunityId,
            entityType: this.ideaEntity.id,
            entityObjectId: row.id,
            displayName: row.title,
            url: `/idea/view/${row.id}`,
            email: 'idea@idea.com',
            entity: this.ideaEntity.entityCode
          };
        });
        return res;
      });
    if (joinData) {
      this.ideas = uniqBy(concat(this.ideas, ideasDetail.data), 'id');
      this.upvotes = merge(this.upvotes, ideasDetail.upvotes);
    } else {
      this.ideas = ideasDetail.data;
      this.upvotes = ideasDetail.upvotes;
    }
    this.currentCount = this.ideas.length || 0;
    if (!this.isFilter) {
      this.notPosted = !(this.ideas && this.ideas.length);
    }
    if (this.ideas.length) {
      this.getOpportunitiesData();
    }
    this.isSearching = false;
    this.activatedRoute.queryParams.subscribe((param) => {
      const ideaId = parseInt(param.oid, 10);
      if (!ideaId) {
        return;
      }
      let ideaIndex;
      const ideaToOpen = find(this.ideas, (idea, index) => {
        const match = ideaId === idea.id;
        if (match) {
          ideaIndex = index;
        }
        return match;
      });
      if (ideaToOpen) {
        this.openSummaryModal(ideaToOpen, ideaIndex);
      } else {
        this.router.navigateByUrl('/error/404');
      }
    });
  }

  getOpportunitiesData() {
    const opportunityIds = map(this.ideas, (idea) => idea.id);
    this.getOpportunitiesPermissions(opportunityIds);
    this.getOpportunitiesExperienceSettings(opportunityIds);
    this.getOpportunitiesDetails(opportunityIds);
  }

  private async getOpportunitiesPermissions(opportunityIds = []) {
    const res = await this.opportunityApiService
      .getOpportunitiesPermissionSettings(opportunityIds)
      .toPromise();
    forEach(
      get(res, 'response', []),
      (s) =>
        (find(this.ideas, (idea) => idea.id === s.opportunityId).permissions =
          s.permissions)
    );
  }

  private async getOpportunitiesExperienceSettings(opportunityIds = []) {
    const res = await this.roleAndPermissionsApi
      .getPermissionsByEntityAndObjectBulk({
        community: this.currentUser.currentCommunityId,
        entityData: map(opportunityIds, (id) => ({
          entityObjectId: id,
          entityType: this.ideaEntity.id
        }))
      })
      .toPromise();

    forEach(get(res, 'response', []), (ideaPerm) => {
      find(this.ideas, [
        'id',
        ideaPerm.entityObjectId
      ]).experienceSettings = ideaPerm;
    });
  }

  private async getOpportunitiesDetails(opportunityIds) {
    const res = await this.opportunityApiService
      .getOpportunityDetails(opportunityIds, {
        upvoteData: 1,
        user: 1,
        workflow: 1,
        stage: 1,
        opportunityType: 1,
        commentCount: 1,
        upvoteCount: 1,
        tags: 1
      })
      .toPromise();

    this.extractDataDictionaries(res);
    this.extractWorkflowData(res);
  }

  private extractDataDictionaries(res) {
    const upvoteData = get(res, 'response.upvoteData', {});
    const commentCounts = get(res, 'response.commentCounts', {});
    const upvoteCounts = get(res, 'response.upvotes', {});
    const tagsData = get(res, 'response.tagsData', {});

    this.upvoteDetail = upvoteData;
    this.commentCounts = commentCounts;
    this.upvoteCount = upvoteCounts;
    this.tagsData = tagsData;
  }

  private extractWorkflowData(res) {
    forEach(get(res, 'response.data', []), (ideaDetail) => {
      const ideaRef = find(this.ideas, ['id', ideaDetail.id]);

      if (ideaDetail.user) {
        ideaRef.user = ideaDetail.user;
      }
      if (ideaDetail.workflow) {
        ideaRef.workflow = ideaDetail.workflow;
      }
      if (ideaDetail.stage) {
        ideaRef.stage = ideaDetail.stage;
      }
      if (ideaDetail.opportunityType) {
        ideaRef.opportunityType = ideaDetail.opportunityType;
      }
    });
  }

  extractData(res: any, joinData = false) {
    if (joinData) {
      this.upvoteCount = merge(this.upvoteCount, res.response.upvotes);
      this.upvoteDetail = merge(this.upvoteDetail, res.response.upvoteData);
      this.tagsData = merge(this.tagsData, res.response.tagsData);
      this.followersData = merge(
        this.followersData,
        res.response.followersData
      );
      this.commentCounts = merge(
        this.commentCounts,
        res.response.commentCounts
      );
      this.topScores = merge(this.topScores, res.response.topScores);
    } else {
      this.upvoteCount = res.response.upvotes;
      this.upvoteDetail = res.response.upvoteData;
      this.tagsData = res.response.tagsData;
      this.followersData = res.response.followersData;
      this.commentCounts = res.response.commentCounts || {};
      this.topScores = res.response.topScores || {};
    }
    this.count = res.response.count || 0;
    return { data: res.response.data, upvotes: res.response.upvotes } || {};
  }

  openSummaryModal(idea, i) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.updatedIdea.subscribe((data) => {
      data.permissions = idea.permissions;
      this.ideas[i] = data;
    });

    modalRef.componentInstance.archive.subscribe((updatedIdea) => {
      this.archiveIdea(updatedIdea);
    });

    modalRef.result.then(
      () => {},
      () => {
        const p = { ...this.activatedRoute.snapshot.queryParams };
        delete p.oid;
        this.util.navigateTo(p);
        this.modalService.dismissAll();
      }
    );
  }

  updateSummaryParams(idea, i) {
    this.util.navigateTo({ oid: idea.id });
    this.openSummaryModal(idea, i);
  }

  // opportunityUpdated(event) {
  //   if (event.updated) {
  //     this.filters.getFilterData();
  //   }
  // }
  opportunityUpdated(event) {}

  cardActions(event, opportunity) {
    switch (event.action) {
      case MANAGE_ACTIONS.edit:
        this.editOpportuntiyModal(opportunity);
        break;
      case MANAGE_ACTIONS.workflow:
        this.editOpportunityWorkflow(opportunity);
        break;
      case MANAGE_ACTIONS.stage:
        this.openChangeStage(opportunity, event.data);
        break;
      case MANAGE_ACTIONS.archive:
        this.openArchiveModal(opportunity);
        break;
      case MANAGE_ACTIONS.settings:
        this.editOpportunitySettingsModal(opportunity);
        break;
    }
  }

  private openArchiveModal(idea) {
    const modalRef = this.modalService.open(ArchiveIdeaModalComponent);
    modalRef.componentInstance.idea = idea;
    modalRef.componentInstance.archive.subscribe(() => {
      modalRef.close();
      this.archiveIdea(idea);
    });
  }

  private editOpportuntiyModal(idea) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.tab = MANAGE_ACTIONS.edit;
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      this.getOpportunities(this.searchParams);
    });
  }

  private editOpportunitySettingsModal(idea) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.tab = MANAGE_ACTIONS.settings;
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      this.getOpportunitiesData();
    });
  }

  private editOpportunityWorkflow(idea) {
    const modalRef = this.modalService.open(AddEditWorkFlowModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = idea;
    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.followerData = this.followersData;
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.getOpportunities(this.searchParams, true);
    });
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  async openChangeStage(opportunity, stage) {
    const modalRef = this.modalService.open(WorkflowChangeStageModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = opportunity;
    modalRef.componentInstance.selectedStage = stage;
    modalRef.componentInstance.workFlowSelected = opportunity.workflow;
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.getOpportunitiesData();
    });
    modalRef.componentInstance.followerData = this.followersData;
  }

  archiveIdea(idea) {
    this.opportunityApiService.archiveOpportunity(idea.id).subscribe(
      (res: any) => {
        this.notifier.showInfo(`${idea.title} has been successfully archived`, {
          positionClass: 'toast-bottom-center'
        });
        const index = this.ideas.findIndex((r) => r.id === idea.id);
        this.ideas.splice(index, 1);
        this.count = this.count - 1;
      },
      (err) => this.notifier.showInfo('Something Went Wrong')
    );
  }
}
