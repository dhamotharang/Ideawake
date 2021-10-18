import * as _ from 'lodash';

import { ActivatedRoute, Router } from '@angular/router';
import {
  AnalyticsApiService,
  EntityApiService,
  NotificationService,
  ProfileApiService
} from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { Chart } from 'chart.js';
import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-container',
  templateUrl: './profile-container.component.html',
  styleUrls: ['./profile-container.component.scss'],
  providers: [ProfileApiService, AnalyticsApiService]
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
  closeResult: string;
  userFollowers = [];
  public user;
  public skills = [];
  public currentUser;
  public userFollowing = false;
  communityId;
  profileId;
  userIdeas = [];
  userEntityId;

  private sub: Subscription;
  chartLabelData = [];
  chartColorData = [];
  chartNumbersData = [];
  donutChart: any;
  constructor(
    private notifier: NotificationService,
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private route: ActivatedRoute,
    private profileApiService: ProfileApiService,
    private router: Router,
    private analyticsApi: AnalyticsApiService,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {
    this.userEntityId = this.entityApi.getEntity(ENTITY_TYPE.USER).id;
    this.route.params.subscribe((params: any) => {
      this.profileId = params.id;
      this.getUserData();
    });
  }

  getUserData() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: UserState) => {
        this.communityId = state.currentCommunityId;
        this.profileApiService
          .getFollowers({
            userId: this.profileId,
            communityId: state.currentCommunityId
          })
          .subscribe(
            (resp: any) => {
              const followerData = (resp.response[0] || []).followerData || [];
              this.userFollowers = _.map(followerData, (e) => {
                if (e.id === state.user.id) {
                  this.userFollowing = true;
                }
                return e;
              });

              if (this.userFollowers[0]) {
                this.userFollowers[0].imgUrl =
                  'https://media.licdn.com/dms/' +
                  'image/C4D03AQGT4h8usocyiw/' +
                  'profile-displayphoto-shrink_200_200/' +
                  '0?e=1579132800&v=beta&t=QcSE0CAvN-wayyq_' +
                  'udaMPemlkXGTyXIsChQr9PM-NBY';
              }
            },
            (err) => {
              // debugger;
            }
          );

        this.currentUser = this.profileId === state.user.id;

        if (this.currentUser) {
          this.user = state.user;
        } else {
          this.profileApiService.getUser(this.profileId).subscribe(
            (res: any) => {
              this.user = res.response[0];
            },
            () => {
              this.router.navigateByUrl('/error/404');
            }
          );
        }

        this.profileApiService
          .getIdeasByUser(this.communityId, this.profileId)
          .subscribe((res: any) => {
            this.userIdeas = res.response.data;
          });
      });

    this.getChartData(this.profileId);
  }

  getChartData(user) {
    let data;
    this.analyticsApi
      .getOpportunityAnalyticsOnStatus({ user })
      .subscribe((res: any) => {
        if (res.response.length) {
          _.forEach(res.response, (statusData: any) => {
            this.chartLabelData.push(statusData.statusTitle);
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

  open(content) {
    this.modalService.open(content, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  followUser() {
    this.profileApiService
      .followUser({
        community: this.communityId,
        entityObjectId: this.profileId,
        entityType: this.userEntityId,
        displayName: 'shName',
        url: 'http:lll.com',
        email: 'a@a.com',
        entity: 'user'
      })
      .subscribe(() => {
        this.userFollowing = true;
        this.notifier.showSuccess('Following User');
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
