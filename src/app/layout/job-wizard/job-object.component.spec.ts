import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobObjectComponent } from './job-object.component';


describe('JobObjectComponent', () => {
  let component: JobObjectComponent;
  let fixture: ComponentFixture<JobObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
