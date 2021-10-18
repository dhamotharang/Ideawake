import * as _ from 'lodash';

import {
  AnalyticsApiService,
  ApiService,
  CommunityApi,
  SharedApi,
  UtilService
} from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Chart } from 'chart.js';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { faStar as farStar } from '@fortawesome/pro-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/pro-solid-svg-icons';
import { UpdatesModalComponent } from 'src/app/modules/shared/components/updates-modal/updates-modal.component';
import { I18nService } from 'src/app/modules/i18n/i18n.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ApiService, AnalyticsApiService]
})
export class HomeComponent implements OnInit, DoCheck, OnDestroy {
  closePostIdeaModalRef: any;
  closeResult: string;
  icon = farStar;
  userData;
  Authenticated = false;
  chartLabelData = [];
  chartColorData = [];
  chartNumbersData = [];
  donutChart: any;
  pieChart: any;

  private sub: Subscription;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private analyticsApi: AnalyticsApiService,
    private communityApi: CommunityApi,
    private ngRedux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private util: UtilService,
    private sharedApi: SharedApi,
    private I18n: I18nService
  ) {}

  rankList = [];

  onMouseEnter() {
    this.icon = fasStar;
  }

  onMouseLeave() {
    this.icon = farStar;
  }

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: UserState) => {
        this.getChartData();
        this.getCommunityLeaderboard({ frequency: 'month' });
      });
    this.loadAnnouncement();
  }

  loadAnnouncement() {
    this.activatedRoute.queryParams.subscribe((param) => {
      const announcementId = parseInt(param.announcementId, 10);
      if (!announcementId) {
        return;
      }
      this.sharedApi.getAnnouncement(announcementId).subscribe(
        (res: any) => {
          if (!_.isEmpty(res.response)) {
            this.openModal(res.response);
          } else {
            this.router.navigateByUrl('/error/404');
          }
        },
        (err) => {
          this.router.navigateByUrl('/error/404');
        }
      );
    });
  }

  openModal(announcement) {
    const modalRef = this.modalService.open(UpdatesModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.level = 'community';
    modalRef.componentInstance.announcement = announcement;

    modalRef.result.then(
      () => {},
      () => {
        const p = { ...this.activatedRoute.snapshot.queryParams };
        delete p.announcementId;
        this.util.navigateTo(p);
        this.modalService.dismissAll();
      }
    );
  }

  getCommunityLeaderboard(frequency) {
    this.communityApi
      .getCommunityLeaderboard(frequency)
      .subscribe((res: any) => {
        this.rankList = res.response;
      });
  }

  getChartData() {
    let data;
    this.analyticsApi
      .getOpportunityAnalyticsOnStatus()
      .subscribe((res: any) => {
        if (res.response.length) {
          _.forEach(res.response, (statusData) => {
            this.chartLabelData.push(
              this.I18n.getTranslation('Statuses.' + statusData.statusTitle)
            );
            this.chartColorData.push(statusData.statusColorCode);
            this.chartNumbersData.push(parseInt(statusData.total, 10));
            data = {
              labels: this.chartLabelData,
              datasets: [
                {
                  label: 'Opportunities By Status',
                  data: this.chartNumbersData,
                  backgroundColor: this.chartColorData,
                  borderWidth: 1
                }
              ]
            };
          });
        } else {
          data = {
            labels: ['No data'],
            datasets: [
              {
                labels: 'No data',
                backgroundColor: ['#D3D3D3'],
                data: [100]
              }
            ]
          };
        }
        this.donutChart = new Chart('donutChart', {
          type: 'doughnut',
          data,
          options: {
            legend: {
              display: true,
              position: 'bottom',
              align: 'start'
            },
            plugins: {
              datalabels: {
                display: false
              }
            }
          }
        });
      });
  }

  onClosePostIdeaPopup(closePopUp: boolean) {
    if (closePopUp) {
      this.closePostIdeaModalRef.close();
    }
  }

  open(content) {
    this.closePostIdeaModalRef = this.modalService.open(content, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      beforeDismiss: this.beforeDismiss
    });
    this.closePostIdeaModalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngDoCheck() {}

  sendInvites() {
    this.router.navigateByUrl('/community/send/invites');
  }
  changeFrequency(event) {}
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
