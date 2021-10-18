import {
  ActivityContainerComponent,
  AddScorecardComponent,
  AppliedFiltersComponent,
  ArchiveGroupsComponent,
  ArchiveUserModalComponent,
  AssignComponent,
  BenefitAddComponent,
  CollectOpportunityTypeComponent,
  ConfirmBoxComponent,
  CostAddComponent,
  CreateGroupsComponent,
  CreateWidgetComponent,
  DatatableComponent,
  EditGroupModalComponent,
  EditIdeaFilterComponent,
  EditProfileModalComponent,
  EditUserRoleModalComponent,
  FilterHorizontalComponent,
  FooterComponent,
  LeaderboardListComponent,
  LeaderboardListSummaryComponent,
  LinkedAddComponent,
  LinkedListComponent,
  ListManagementOptionsComponent,
  LockComponentComponent,
  ManageUserGroupsModalComponent,
  MarkupEditorComponent,
  MergedAddComponent,
  MergedListComponent,
  ModalContainerComponent,
  MultiselectDropdownComponent,
  NonFinancialBenefitAddComponent,
  PostTypeSummaryWidgetComponent,
  PrizeAddComponent,
  PrizeAddEditComponent,
  PrizeAwardComponent,
  PrizeListComponent,
  PrizeRedeemComponent,
  PrizeWidgetComponent,
  ProfileMissionsComponent,
  ProgressStepsComponent,
  RulesListComponent,
  SelectedAccessComponent,
  ShareComponent,
  SimilarIdeasComponent,
  TablePaginationComponent,
  TopJumbotronComponent,
  TypesListComponent,
  UpdateAudienceComponent,
  UpdateCreateComponent,
  UpdatesListComponent,
  UpdatesSummaryListComponent,
  UserModalComponent,
  UsersListModalComponent,
  VisibilitySubmissionFormComponent
} from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  GroupsApiService,
  ShareDataService,
  SharedApi,
  SharingApiService,
  SocketService
} from '../../services';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  StripSpaces,
  TimeAgoPipe,
  TimeLeftPipe,
  SafeHtmlPipe,
  pluralizePipe
} from '../../pipes';

import { ApplicationPipesModule } from '../search/pipes.module';
import { CDKModule } from '../../cdk-module';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { I18nModule } from '../i18n/i18n.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LoadersModule } from '../loaders/loaders.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { SearchModule } from '../search/search.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { TagMentionModule } from '../tag-mention';
import { UploadsModule } from '../uploads/uploads.module';
import { MediaModule } from '../media/media.module';
import { UpdatesModalComponent } from './components/updates-modal/updates-modal.component';
import { CustomDataTableComponent } from './components/custom-data-table/custom-data-table.component';
import { DecimalPipe } from '@angular/common';
import { EditIdeaColumnComponent } from './components/edit-idea-columns/edit-idea-columns.component';

// @dynamic
@NgModule({
  declarations: [
    MarkupEditorComponent,
    FilterHorizontalComponent,
    FooterComponent,
    DatatableComponent,
    UserModalComponent,
    EditGroupModalComponent,
    CreateGroupsComponent,
    ModalContainerComponent,
    ArchiveGroupsComponent,
    MultiselectDropdownComponent,
    EditProfileModalComponent,
    UsersListModalComponent,
    ArchiveUserModalComponent,
    EditUserRoleModalComponent,
    ManageUserGroupsModalComponent,
    SimilarIdeasComponent,
    ShareComponent,
    AppliedFiltersComponent,
    TimeAgoPipe,
    TimeLeftPipe,
    SafeHtmlPipe,
    pluralizePipe,
    SelectedAccessComponent,
    StripSpaces,
    ProgressStepsComponent,
    LeaderboardListComponent,
    LeaderboardListSummaryComponent,
    ProfileMissionsComponent,
    PrizeListComponent,
    TopJumbotronComponent,
    ActivityContainerComponent,
    CollectOpportunityTypeComponent,
    AddScorecardComponent,
    RulesListComponent,
    AssignComponent,
    ConfirmBoxComponent,
    PrizeAwardComponent,
    PrizeAddComponent,
    PrizeWidgetComponent,
    PrizeRedeemComponent,
    UpdatesSummaryListComponent,
    UpdatesListComponent,
    UpdateCreateComponent,
    UpdateAudienceComponent,
    TypesListComponent,
    PostTypeSummaryWidgetComponent,
    LockComponentComponent,
    MergedListComponent,
    LinkedListComponent,
    LinkedAddComponent,
    PrizeAddEditComponent,
    MergedAddComponent,
    BenefitAddComponent,
    CostAddComponent,
    NonFinancialBenefitAddComponent,
    TablePaginationComponent,
    VisibilitySubmissionFormComponent,
    ListManagementOptionsComponent,
    EditIdeaFilterComponent,
    CreateWidgetComponent,
    UpdatesModalComponent,
    CustomDataTableComponent,
    EditIdeaColumnComponent
  ],
  imports: [
    ApplicationPipesModule,
    FontAwesomeModule,
    CommonModule,
    NgbModule,
    NgxDatatableModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    UploadsModule,
    TagMentionModule,
    SocialActivityModule,
    SearchModule,
    LoadersModule,
    RouterModule,
    I18nModule,
    EditorModule,
    DragDropModule,
    CDKModule,
    LazyLoadImageModule,
    MediaModule
  ],
  entryComponents: [
    CreateGroupsComponent,
    EditGroupModalComponent,
    EditProfileModalComponent,
    CollectOpportunityTypeComponent,
    ConfirmBoxComponent,
    PrizeAddEditComponent,
    EditIdeaFilterComponent,
    EditIdeaColumnComponent,
    LinkedAddComponent
  ],
  providers: [
    SocketService,
    SharedApi,
    SharingApiService,
    GroupsApiService,
    DecimalPipe
  ],
  exports: [
    SearchModule,
    PrizeListComponent,
    PrizeAwardComponent,
    PrizeAddComponent,
    PrizeWidgetComponent,
    ProgressStepsComponent,
    StripSpaces,
    MarkupEditorComponent,
    FilterHorizontalComponent,
    FooterComponent,
    FontAwesomeModule,
    NgbModule,
    DatatableComponent,
    NgxDatatableModule,
    UserModalComponent,
    EditGroupModalComponent,
    CreateGroupsComponent,
    ModalContainerComponent,
    ArchiveGroupsComponent,
    MultiselectDropdownComponent,
    UsersListModalComponent,
    ArchiveUserModalComponent,
    EditUserRoleModalComponent,
    ManageUserGroupsModalComponent,
    TimeAgoPipe,
    TimeLeftPipe,
    SafeHtmlPipe,
    pluralizePipe,
    AddScorecardComponent,
    RulesListComponent,
    SimilarIdeasComponent,
    ShareComponent,
    AppliedFiltersComponent,
    SelectedAccessComponent,
    LeaderboardListComponent,
    LeaderboardListSummaryComponent,
    ProfileMissionsComponent,
    PostTypeSummaryWidgetComponent,
    TopJumbotronComponent,
    ActivityContainerComponent,
    CollectOpportunityTypeComponent,
    ConfirmBoxComponent,
    TypesListComponent,
    UpdatesSummaryListComponent,
    UpdatesListComponent,
    UpdateCreateComponent,
    LockComponentComponent,
    LinkedAddComponent,
    LinkedListComponent,
    MergedListComponent,
    PrizeAddEditComponent,
    MergedAddComponent,
    I18nModule,
    NonFinancialBenefitAddComponent,
    BenefitAddComponent,
    CostAddComponent,
    TablePaginationComponent,
    AssignComponent,
    VisibilitySubmissionFormComponent,
    ListManagementOptionsComponent,
    EditIdeaFilterComponent,
    CreateWidgetComponent,
    UpdateAudienceComponent,
    CustomDataTableComponent,
    LazyLoadImageModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ShareDataService]
    };
  }
}
