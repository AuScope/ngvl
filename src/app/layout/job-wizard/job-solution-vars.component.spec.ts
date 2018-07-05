import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSolutionVarsComponent } from './job-solution-vars.component';

describe('JobSolutionVarsComponent', () => {
  let component: JobSolutionVarsComponent;
  let fixture: ComponentFixture<JobSolutionVarsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobSolutionVarsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobSolutionVarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
