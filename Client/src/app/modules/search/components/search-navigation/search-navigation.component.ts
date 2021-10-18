import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ElasticSearchApiService, StorageService } from '../../../../services';
import {
  SEARCH_RESULT_TYPE_ENUM,
  DEFAULT_PRELOADED_IMAGE,
  CHALLENGE_DEFAULT_BANNER
} from '../../../../utils';
import { get, uniqWith, uniq, isEmpty } from 'lodash';
@Component({
  selector: 'app-search-navigation',
  templateUrl: './search-navigation.component.html',
  styleUrls: ['./search-navigation.component.scss']
})
export class SearchNavigationComponent implements OnInit {
  @ViewChild('myDrop', { static: true }) myDrop: NgbDropdown;
  public modelChanged: Subject<string> = new Subject<string>();
  public dataTypes = SEARCH_RESULT_TYPE_ENUM;
  public recentOpened = [];
  public recentSearch = [];
  public datasetArray = [];
  public searching = false;
  public text = '';
  public defaultImage = DEFAULT_PRELOADED_IMAGE;
  public defaultImageChallenge = CHALLENGE_DEFAULT_BANNER;
  constructor(
    private router: Router,
    private storageService: StorageService,
    private elasticSearchService: ElasticSearchApiService
  ) {
    this.modelChanged.pipe(debounceTime(1000)).subscribe((model) => {
      this.getDataSet(model);
    });
  }

  ngOnInit() {
    this.getRecent();
  }

  closeDropdown() {
    this.myDrop.close();
  }

  getRecent() {
    this.recentOpened = this.storageService.getItem('recentViewed') || [];
    this.recentSearch = this.storageService.getItem('recentSearch') || [];
  }

  saveRecentSearch(data) {
    this.recentSearch.unshift(data);
    this.recentSearch = uniq(this.recentSearch);
    if (this.recentSearch.length > 2) {
      this.recentSearch = this.recentSearch.slice(0, 2);
    }
    this.storageService.setItem('recentSearch', this.recentSearch);
  }

  saveRecentViewed(data) {
    this.recentOpened.unshift(data);
    this.recentOpened = uniqWith(this.recentOpened, (arrVal, othVal) => {
      return arrVal.data.id === othVal.data.id && arrVal.type === othVal.type;
    });
    if (this.recentOpened.length > 4) {
      this.recentOpened = this.recentOpened.slice(0, 4);
    }
    this.storageService.setItem('recentViewed', this.recentOpened);
  }

  onSearch(val) {
    this.modelChanged.next(val);
  }

  getOpportunityImage(dataObject) {
    return get(
      dataObject,
      'data.opportunityAttachments[0].url',
      'https://ideawake-test.s3.amazonaws.com/attachments/opportunity/1600938858832default.png'
    );
  }

  getValue(obj, path, defaultValue = null) {
    return get(obj, path, defaultValue);
  }

  getTitle(obj, path, limit = 40) {
    let title = get(obj, path, null);
    if (title.length > limit) {
      title = title.substring(0, limit) + ` ...`;
    }
    return title;
  }

  opportunityClicked(dataValue) {
    this.saveRecentViewed(dataValue);
    this.router.navigate(['/idea/view/', dataValue.data.id]);
    this.closeDropdown();
  }

  challengeClicked(dataValue) {
    this.saveRecentViewed(dataValue);
    this.router.navigate(['/challenges/view/', dataValue.data.id]);
    this.closeDropdown();
  }

  userClicked(dataValue) {
    this.saveRecentViewed(dataValue);
    this.router.navigate(['/profile/view/', dataValue.data.id]);
    this.closeDropdown();
  }

  searchAgain(text) {
    this.text = text;
    this.saveRecentSearch(text);
    this.getDataSet(text);
  }

  getDataSet(text) {
    this.myDrop.open();
    if (isEmpty(text)) {
      this.datasetArray = [];
      return false;
    }
    const param = { query: text };
    this.searching = true;
    this.elasticSearchService.navigationSearch(param).subscribe((res: any) => {
      this.searching = false;
      this.datasetArray = get(res, 'response.results', []);
      this.saveRecentSearch(text);
    });
  }
}
