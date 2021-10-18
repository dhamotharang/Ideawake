import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportIdeas } from 'src/app/utils';
import { cloneDeep } from 'lodash';
import { OpportunityApiService, UtilService } from '../../../../services';

@Component({
  selector: 'app-idea-export',
  templateUrl: './idea-export.component.html',
  styleUrls: ['./idea-export.component.scss']
})
export class IdeaExportComponent implements OnInit, OnChanges {
  @Input() appliedFilters = [];
  @Input() filterCount = 0;
  @Input() challengeId = null;
  totalCount = 0;
  public exportConfig: ExportIdeas = {
    exportFormat: 'csv',
    anonymizedExport: true,
    opportunityFilters: {
      isDeleted: false
    }
  };
  defaultFilterObj: any = {
    isDeleted: false
  };
  public applyFilter: boolean = false;
  public isLoading = false;
  constructor(
    private modalService: NgbModal,
    private opportunityApi: OpportunityApiService,
    private util: UtilService
  ) {}

  ngOnInit() {
    let params = { ...this.defaultFilterObj };
    this.challengeId &&
      (params = { ...params, ...{ challengeId: this.challengeId } });
    this.opportunityApi.getOpportunityCount(params).subscribe((x: any) => {
      if (x.response) {
        this.totalCount = x.response.count;
      }
    });
  }
  ngOnChanges() {
    if (this.challengeId) {
      this.defaultFilterObj.challenge = this.challengeId;
    } else {
      delete this.defaultFilterObj.challenge;
    }
  }
  open(content) {
    this.modalService.open(content, {
      size: 'lg'
    });
  }
  exportData() {
    this.isLoading = true;
    if (this.applyFilter) {
      let filters = cloneDeep(this.appliedFilters);
      delete filters.skip;
      delete filters.take;
      delete filters.community;
      this.exportConfig.opportunityFilters = {
        ...this.exportConfig.opportunityFilters,
        ...filters,
        ...this.defaultFilterObj
      };
    } else {
      this.exportConfig.opportunityFilters = {
        ...this.defaultFilterObj
      };
    }
    if (this.challengeId) {
      this.exportConfig.opportunityFilters = {
        ...this.exportConfig.opportunityFilters,
        ...{ challenge: this.challengeId }
      };
    }
    this.opportunityApi
      .exportOpportunities(this.exportConfig)
      .subscribe((x: any) => {
        if (x.wasSuccess && x.response && x.response.url) {
          this.util.downloadFile({
            url: x.response.url,
            name: x.response.fileName
          });
        }
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
