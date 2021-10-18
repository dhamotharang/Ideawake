import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWidgetComponent } from './create-widget.component';

describe('CreateWidgetComponent', () => {
  let component: CreateWidgetComponent;
  let fixture: ComponentFixture<CreateWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
