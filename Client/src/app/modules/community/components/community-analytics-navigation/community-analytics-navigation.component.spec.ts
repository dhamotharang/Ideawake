import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityAnalyticsNavigationComponent } from './community-analytics-navigation.component';

describe('CommunityAnalyticsNavigationComponent', () => {
  let component: CommunityAnalyticsNavigationComponent;
  let fixture: ComponentFixture<CommunityAnalyticsNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityAnalyticsNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityAnalyticsNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
