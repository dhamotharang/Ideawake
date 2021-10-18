import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaLearningModuleComponent } from './idea-learning-module.component';

describe('IdeaLearningModuleComponent', () => {
  let component: IdeaLearningModuleComponent;
  let fixture: ComponentFixture<IdeaLearningModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeaLearningModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeaLearningModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
