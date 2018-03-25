import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionsBrowserComponent } from './solutions-browser.component';

describe('SolutionsBrowserComponent', () => {
  let component: SolutionsBrowserComponent;
  let fixture: ComponentFixture<SolutionsBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionsBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionsBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
