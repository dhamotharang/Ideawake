import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LOAD_SELECTED_IDEA_FILES } from '../../../../actions';
import { ApiService, OpportunityApiService } from '../../../../services';
import { AppState, Files, STATE_TYPES } from '../../../../store';

@Component({
  selector: 'app-idea-files-container',
  templateUrl: './idea-files-container.component.html',
  styleUrls: ['./idea-files-container.component.scss']
})
export class IdeaFilesContainerComponent implements OnInit, OnDestroy {
  @Input() ideaId = this.route.snapshot.paramMap.get('id');
  @Input() userOpportunityPermissions;
  idea;
  files = [];
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private opportunityApi: OpportunityApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  async ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.files = files.ideaFiles.selected;
      });

    const communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.idea = await this.apiService
      .get(
        `/opportunity?community=${communityId}&isDeleted=false&id=${this.ideaId}`
      )
      .toPromise()
      .then((res: any) => {
        this.ngRedux.dispatch({
          type: LOAD_SELECTED_IDEA_FILES,
          selected: res.response.data[0].opportunityAttachments
        });
        return res.response.data[0];
      });
  }

  editIdeaImages() {
    this.opportunityApi
      .updateOpportunity(this.idea.id, {
        stopNotifications: true,
        title: this.idea.title,
        attachments: this.files
      })
      .subscribe();
  }
  async ngOnDestroy() {
    /* await this.apiService
      .patch(`/opportunity/${this.idea.id}`, {
        title: this.idea.title,
        description: this.idea.description,
        community: this.idea.community.id,
        // opportunityType: 'idea',
        draft: this.idea.draft,
        anonymous: this.idea.anonymous,
        tags: this.idea.tags,
        mentions: this.idea.mentions,
        attachments: this.files,
        stopNotifications: true
      })
      .toPromise()
      .then((res) => res); */
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
