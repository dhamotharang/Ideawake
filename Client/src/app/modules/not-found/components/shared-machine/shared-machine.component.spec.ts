import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMachineComponent } from './shared-machine.component';

describe('SharedMachineComponent', () => {
  let component: SharedMachineComponent;
  let fixture: ComponentFixture<SharedMachineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharedMachineComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
