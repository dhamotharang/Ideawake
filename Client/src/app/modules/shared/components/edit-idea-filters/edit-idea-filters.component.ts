import {
  differenceBy,
  filter,
  remove,
  map,
  forEach,
  get,
  find,
  set,
  findIndex,
  includes,
  keyBy
} from 'lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import { CustomFieldApiService } from '../../../../services';
import {
  ON_PAGE_DEFAULT_FILTERS,
  PAGE_TYPE_ENUM,
  CUSTOM_FIELD_TYPES
} from '../../../../utils';
import { OPPORTUNITY_FILTERS } from '../../../../actions';
import { OpportunityApiService } from '../../../../services';
@Component({
  selector: 'app-edit-idea-filters',
  templateUrl: './edit-idea-filters.component.html',
  styleUrls: ['./edit-idea-filters.component.scss']
})
export class EditIdeaFilterComponent implements OnInit {
  @Input() pageType = PAGE_TYPE_ENUM.challenge;
  @Input() selectedFilters = [];
  @Output() selectedFields = new EventEmitter<any>();
  @Output() closed = new EventEmitter<boolean>();
  @Output() filterUpdated = new EventEmitter<boolean>();
  public fieldTypes = [];
  public allCustomFields = [];
  public textSearch = '';
  public order = 0;
  public onPageFilters = ON_PAGE_DEFAULT_FILTERS;
  public currentUser = this.ngRedux.getState().userState;
  constructor(
    private customFieldsApi: CustomFieldApiService,
    private opportunityApiService: OpportunityApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  async ngOnInit() {
    await this.getFieldTypes();
    this.getFilters();
  }

  getFilters() {
    const params = {
      pageType: this.pageType,
      community: this.currentUser.currentCommunityId
    };
    this.opportunityApiService
      .getOpportunityFilterOptions(params)
      .subscribe((res: any) => {
        const options = get(res.response[0], 'optionsData', []);
        if (options.length) {
          this.selectedFilters = options;
          this.OldOnPageSelection();
        } else {
          this.selectedFilters = filter(ON_PAGE_DEFAULT_FILTERS, {
            selected: true
          });
        }
        this.reOrder();
        this.getFieldsList(true);
      });
  }

  searchText(text) {
    this.textSearch = text;
  }

  OldOnPageSelection() {
    this.onPageFilters.forEach((value, i) => {
      this.onPageFilters[i].selected = false;
    });

    forEach(this.selectedFilters, (value) => {
      if (value.onPage) {
        set(
          find(this.onPageFilters, { uniqueId: value.uniqueId }),
          'selected',
          true
        );
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.selectedFilters,
      event.previousIndex,
      event.currentIndex
    );
    this.reOrder();
  }

  reOrder() {
    let index = 1;
    this.selectedFilters = map(this.selectedFilters, (v) => {
      v.order = index;
      index++;
      return v;
    });
  }

  selectCustomFields(customField) {
    if (findIndex(this.selectedFilters, { id: customField.id }) === -1) {
      customField.order = this.selectedFilters.length;
      customField.onPage = false;
      this.selectedFilters.push(customField);
      remove(this.allCustomFields, (c) => c.id === customField.id);
      this.reOrder();
    }
  }

  filterSelections(onPageFilter) {
    if (
      findIndex(this.selectedFilters, {
        onPage: true,
        uniqueId: onPageFilter.uniqueId
      }) === -1
    ) {
      this.selectedFilters.push(onPageFilter);
      this.reOrder();
    }
  }

  removeSelection(uniqueId, onPage) {
    this.selectedFilters = filter(this.selectedFilters, (f) => {
      return f.uniqueId !== uniqueId;
    });
    this.reOrder();
    if (onPage) {
      forEach(this.onPageFilters, (value, key) => {
        if (value.uniqueId === uniqueId) {
          this.onPageFilters[key].selected = false;
        }
      });
    } else {
      this.getFieldsList();
    }
  }

  getFieldTypes() {
    this.customFieldsApi.getTypes().subscribe((res: any) => {
      const myTypes = filter(res.response, (value) => {
        return includes(
          [
            CUSTOM_FIELD_TYPES.SINGLE_SELECT,
            CUSTOM_FIELD_TYPES.MULTI_SELECT,
            CUSTOM_FIELD_TYPES.DATEPICKER,
            CUSTOM_FIELD_TYPES.NUMBER,
            CUSTOM_FIELD_TYPES.SINGLE_LINE_TEXT,
            CUSTOM_FIELD_TYPES.MULTI_LINE_TEXT,
            CUSTOM_FIELD_TYPES.FILE_UPLOAD,
            CUSTOM_FIELD_TYPES.VIDEO_UPLOAD,
            CUSTOM_FIELD_TYPES.RICH_TEXT
          ],
          value.abbreviation
        );
      });
      this.fieldTypes = map(myTypes, 'id');
    });
  }

  getFieldsList(replaceSelected = false) {
    this.customFieldsApi
      .getAllCustomFields({
        isDeleted: false,
        customFieldTypes: this.fieldTypes,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        if (replaceSelected) {
          // In Case Field Changed
          const keyByFields = keyBy(res.response, 'id');
          this.selectedFilters = map(this.selectedFilters, (singleObject) => {
            if (!singleObject.onPage) {
              const temp = get(keyByFields, singleObject.id, singleObject);
              temp.order = singleObject.order;
              return temp;
            } else {
              return singleObject;
            }
          });
        }
        this.allCustomFields = res.response;
        this.allCustomFields = differenceBy(
          this.allCustomFields,
          this.selectedFilters,
          'id'
        );
      });
  }

  close() {
    this.closed.emit(true);
  }

  save() {
    const body = {
      pageType: this.pageType,
      optionsData: this.selectedFilters,
      community: this.currentUser.currentCommunityId
    };
    this.opportunityApiService
      .updateOpportunityFilterOptions(body)
      .subscribe((res: any) => {
        this.ngRedux.dispatch({
          type: OPPORTUNITY_FILTERS,
          list: this.selectedFilters
        });
        this.filterUpdated.emit(true);
        this.closed.emit(true);
      });
  }
}
