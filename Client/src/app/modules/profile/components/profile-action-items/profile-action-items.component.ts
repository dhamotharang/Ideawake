import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';
import {
  HeaderApiService,
  OpportunityApiService,
  ActionItemSocketService
} from '../../../../services';
import { AppState } from '../../../../store';
import { ACTION_ITEM_INFO } from '../../../../utils';
import { get, map, keyBy, round, first } from 'lodash';
@Component({
  selector: 'app-profile-action-items',
  templateUrl: './profile-action-items.component.html',
  styleUrls: ['./profile-action-items.component.scss']
})
export class ProfileActionItemsComponent implements OnInit, OnDestroy {
  public isLoading = false;
  public ideaId = null;
  public tool = null;
  public breadcrumb = 'Reviews';
  public itemsList = [];
  public itemsScore = [];
  public itemsStatusCount;
  public ActionItemLogStatus = {
    OPEN: 'open',
    COMPLETE: 'complete',
    INCOMPLETE: 'incomplete'
  };
  public status = 'open';
  public currentUser = this.ngRedux.getState().userState;
  private sub: Subscription;
  constructor(
    private ngRedux: NgRedux<AppState>,
    private socket: ActionItemSocketService,
    private headerApi: HeaderApiService,
    private opportunityApiService: OpportunityApiService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params.tool === ACTION_ITEM_INFO.scorecard.abbreviation) {
        this.breadcrumb = 'Reviews';
      } else if (params.tool === ACTION_ITEM_INFO.refinement.abbreviation) {
        this.breadcrumb = 'Refinement';
      } else {
        this.breadcrumb = null;
      }
      this.changeIdea(params.idea);
      this.tool = params.tool;
      this.getActionItems({
        actionItemAbbreviation: this.tool,
        status: this.status
      });
      this.getActionItemsCounts();
    });
    const socketKey = `action-item-log-${this.currentUser.user.id}-${this.currentUser.currentCommunityId}`;
    this.sub = this.socket.fromEvent(socketKey).subscribe((res: any) => {
      this.getActionItems(
        {
          actionItemAbbreviation: this.tool,
          status: this.status
        },
        true
      );
      this.getActionItemsCounts();
    });
  }

  private getActionItems(param, loadNext = false) {
    this.isLoading = true;
    this.headerApi.getActionItems(param).subscribe(
      (res: any) => {
        const response = res.response;
        this.itemsList = get(response, 'actionItemLogs', []);
        this.getScore();
        this.isLoading = false;
        if (first(this.itemsList) && loadNext) {
          this.changeIdea(first(this.itemsList).entityObjectId);
        }
      },
      (err) => (this.isLoading = false)
    );
  }

  private getActionItemsCounts() {
    this.opportunityApiService
      .getActionItemStatusCounts({
        actionItemAbbreviation: this.tool
      })
      .subscribe((res: any) => {
        this.itemsStatusCount = res.response;
      });
  }

  getScore() {
    const params = {
      community: this.currentUser.currentCommunityId,
      opportunityIds: map(this.itemsList, 'entityObjectId')
    };
    this.opportunityApiService
      .getOpportunitiesScore(params)
      .subscribe((res: any) => {
        this.itemsScore = keyBy(res.response, 'opportunityId');
      });
  }

  getScoreOfOpportunity(id) {
    const oppScore = get(this.itemsScore, id, null);
    const finalScore = get(oppScore, 'opportunityScore.finalScore', null);
    if (finalScore) {
      return round(finalScore, 2);
    } else {
      return '- - -';
    }
  }

  changeStatus(type) {
    this.status = type;
    this.getActionItems({
      actionItemAbbreviation: this.tool,
      status: this.status
    });
  }

  changeIdea(id) {
    this.ideaId = null;
    setTimeout(() => {
      this.ideaId = id;
    }, 0);
  }
}
