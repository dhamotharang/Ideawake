import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpportunityApiService, UtilService } from 'src/app/services';

@Component({
  selector: 'app-idea-evaluations-export',
  templateUrl: './idea-evaluations-export.component.html',
  styleUrls: ['./idea-evaluations-export.component.scss']
})
export class IdeaEvaluationsExportComponent implements OnInit {
  @Input() idea;
  @Input() entityTypeId;

  public isLoading = false;
  public exportFormat = 'csv';

  constructor(
    private modalService: NgbModal,
    private opportunityAPIService: OpportunityApiService,
    private util: UtilService
  ) {}

  ngOnInit() {}

  open(content) {
    this.modalService.open(content, {
      size: 'lg'
    });
  }

  exportData() {
    this.isLoading = true;
    const params = {
      entityTypeId: this.entityTypeId,
      opportunityId: this.idea.id,
      exportFormat: this.exportFormat
    };
    this.opportunityAPIService
      .exportEvaluation(params)
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
