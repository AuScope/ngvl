import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionVarBindingComponent } from './solution-var-binding.component';

describe('SolutionVarBindingComponent', () => {
  let component: SolutionVarBindingComponent;
  let fixture: ComponentFixture<SolutionVarBindingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionVarBindingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionVarBindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
