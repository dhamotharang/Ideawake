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
import {
  CustomFieldApiService,
  ReviewCriteriaApiService
} from '../../../../services';
import {
  PAGE_TYPE_ENUM,
  CUSTOM_FIELD_TYPES,
  IDEA_LIST_DEFAULT_COLUMNS,
  IDEA_LIST_OTHER_COLUMNS
} from '../../../../utils';
import { OpportunityApiService } from '../../../../services';
@Component({
  selector: 'app-edit-idea-columns',
  templateUrl: './edit-idea-columns.component.html',
  styleUrls: ['./edit-idea-columns.component.scss']
})
export class EditIdeaColumnComponent implements OnInit {
  @Input() pageType = PAGE_TYPE_ENUM.challenge;
  @Input() selectedColumns = [];
  @Output() selectedFields = new EventEmitter<any>();
  @Output() closed = new EventEmitter<boolean>();
  @Output() columnUpdated = new EventEmitter<boolean>();
  public fieldTypes = [];
  public allCustomFields = [];
  public allCriteriaFields = [];
  public textSearch = '';
  public order = 0;
  public onPageColumns = IDEA_LIST_DEFAULT_COLUMNS;
  public onPageOtherColumns = IDEA_LIST_OTHER_COLUMNS;
  public currentUser = this.ngRedux.getState().userState;
  constructor(
    private customFieldsApi: CustomFieldApiService,
    private opportunityApiService: OpportunityApiService,
    private ngRedux: NgRedux<AppState>,
    private reviewCriteriaApiService: ReviewCriteriaApiService
  ) {}

  async ngOnInit() {
    this.getColumns();
  }

  getColumns() {
    const params = {
      pageType: this.pageType,
      community: this.currentUser.currentCommunityId
    };
    this.opportunityApiService
      .getOpportunityColumnOptions(params)
      .subscribe((res: any) => {
        const options = get(res.response[0], 'optionsData', []);
        if (options.length) {
          this.selectedColumns = options;
          this.OldOnPageSelection();
        } else {
          this.selectedColumns = filter(IDEA_LIST_DEFAULT_COLUMNS, {
            selected: true
          });
        }
        this.reOrder();
        this.getFieldsList(true);
        this.getCriterias(true);
      });
  }

  searchText(text) {
    this.textSearch = text;
  }

  OldOnPageSelection() {
    this.onPageColumns.forEach((value, i) => {
      this.onPageColumns[i].selected = false;
    });
    this.onPageOtherColumns.forEach((value, i) => {
      this.onPageOtherColumns[i].selected = false;
    });
    forEach(this.selectedColumns, (value) => {
      if (value.onPage) {
        set(
          find(this.onPageColumns, { uniqueId: value.uniqueId }),
          'selected',
          true
        );
        set(
          find(this.onPageOtherColumns, { uniqueId: value.uniqueId }),
          'selected',
          true
        );
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex != 0 && event.currentIndex != 0) {
      moveItemInArray(
        this.selectedColumns,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.reOrder();
  }

  reOrder() {
    let index = 1;
    this.selectedColumns = map(this.selectedColumns, (v) => {
      v.order = index;
      index++;
      return v;
    });
  }

  selectCustomFields(customField) {
    if (
      findIndex(this.selectedColumns, { uniqueId: customField.uniqueId }) === -1
    ) {
      customField.order = this.selectedColumns.length;
      customField.onPage = false;
      this.selectedColumns.push(customField);
      remove(this.allCustomFields, (c) => c.uniqueId === customField.uniqueId);
      this.reOrder();
    }
  }

  selectCriteriaFields(cirteriaField) {
    if (
      findIndex(this.selectedColumns, { uniqueId: cirteriaField.uniqueId }) ===
      -1
    ) {
      cirteriaField.order = this.selectedColumns.length;
      cirteriaField.onPage = false;
      this.selectedColumns.push(cirteriaField);
      remove(
        this.allCriteriaFields,
        (c) => c.uniqueId === cirteriaField.uniqueId
      );
      this.reOrder();
    }
  }

  filterSelections(onPageFilter, choice, uniqueId) {
    if (choice == 'default') {
      const col = find(this.onPageColumns, { uniqueId: uniqueId });
      col.selected = !col.selected;
    } else {
      const col = find(this.onPageOtherColumns, { uniqueId: uniqueId });
      col.selected = !col.selected;
    }

    if (
      findIndex(this.selectedColumns, {
        onPage: true,
        uniqueId: onPageFilter.uniqueId
      }) === -1
    ) {
      this.selectedColumns.push(onPageFilter);
      this.reOrder();
    }
  }

  removeSelection(value) {
    this.selectedColumns = filter(this.selectedColumns, (f) => {
      return f.uniqueId !== value.uniqueId;
    });
    this.reOrder();
    if (value.onPage) {
      const col1 = find(this.onPageColumns, { uniqueId: value.uniqueId });
      if (col1) col1.selected = false;
      const col2 = find(this.onPageOtherColumns, { uniqueId: value.uniqueId });
      if (col2) col2.selected = false;
    } else {
      if (value.type == 'criteria') {
        this.getCriterias();
      } else {
        this.getFieldsList();
      }
    }
  }

  getFieldsList(replaceSelected = false) {
    this.customFieldsApi
      .getAllCustomFields({
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        res.response.forEach((element, i) => {
          res.response[i]['uniqueId'] = 'customField' + res.response[i].id;
          res.response[i]['type'] = 'customField';
        });
        if (replaceSelected) {
          // In Case Field Changed
          const keyByFields = keyBy(res.response, 'uniqueId');
          this.selectedColumns = map(this.selectedColumns, (singleObject) => {
            if (!singleObject.onPage) {
              const temp = get(
                keyByFields,
                singleObject.uniqueId,
                singleObject
              );
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
          this.selectedColumns,
          'uniqueId'
        );
      });
  }

  getCriterias(replaceSelected = false) {
    this.reviewCriteriaApiService
      .getAll({
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        res.response.forEach((element, i) => {
          res.response[i]['uniqueId'] = 'criteria' + res.response[i].id;
          res.response[i]['type'] = 'criteria';
        });

        if (replaceSelected) {
          // In Case Field Changed
          const keyByFields = keyBy(res.response, 'uniqueId');
          this.selectedColumns = map(this.selectedColumns, (singleObject) => {
            if (!singleObject.onPage) {
              const temp = get(
                keyByFields,
                singleObject.uniqueId,
                singleObject
              );
              temp.order = singleObject.order;
              return temp;
            } else {
              return singleObject;
            }
          });
        }
        this.allCriteriaFields = res.response;
        this.allCriteriaFields = differenceBy(
          this.allCriteriaFields,
          this.selectedColumns,
          'uniqueId'
        );
      });
  }

  close() {
    this.closed.emit(true);
  }

  save() {
    const body = {
      pageType: this.pageType,
      optionsData: this.selectedColumns,
      community: this.currentUser.currentCommunityId
    };
    this.opportunityApiService
      .updateOpportunityColumnOptions(body)
      .subscribe((res: any) => {
        this.columnUpdated.emit(true);
        this.closed.emit(true);
      });
  }
}
