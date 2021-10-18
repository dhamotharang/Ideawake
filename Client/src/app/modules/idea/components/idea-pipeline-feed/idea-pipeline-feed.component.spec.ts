import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaPipelineFeedComponent } from './idea-pipeline-feed.component';

describe('IdeaPipelineFeedComponent', () => {
  let component: IdeaPipelineFeedComponent;
  let fixture: ComponentFixture<IdeaPipelineFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdeaPipelineFeedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaPipelineFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
