import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { get, isEmpty } from 'lodash';

import { AuthorizationApiService } from '../../../../services';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-community-search',
  templateUrl: './community-search.component.html',
  styleUrls: ['./community-search.component.scss']
})
export class CommunitySearchComponent implements OnInit {
  public modelChanged: Subject<string> = new Subject<string>();
  public params = this.route.snapshot.queryParams;
  public domainName = environment.domainName;
  public validCommunityUrl = false;
  public communityUrl = '';
  public subdomain = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authorizationApi: AuthorizationApiService
  ) {
    this.modelChanged.pipe(debounceTime(500)).subscribe((model) => {
      this.getCommunity(model);
    });
  }

  ngOnInit() {}

  onSearch(val) {
    this.modelChanged.next(val);
  }

  getCommunity(subdomain) {
    this.validCommunityUrl = false;
    const url = `${subdomain}.${this.domainName}`;
    this.authorizationApi
      .getCommunityDataBeforeLogin({ url })
      .subscribe((res: any) => {
        this.validCommunityUrl = get(res.response, 'valid', false);
        this.communityUrl = url;
      });
  }

  redirectToLogin() {
    const url = new URL(window.location.href);
    const redirectUrl = isEmpty(url.port)
      ? this.communityUrl
      : `${this.communityUrl}:${url.port}`;
    const redirectTo = `${url.protocol}//${redirectUrl}/auth/login${url.search}`;
    window.location.href = redirectTo;
  }
}
