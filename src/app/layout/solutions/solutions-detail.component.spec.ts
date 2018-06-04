import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionsDetailComponent } from './solutions-detail.component';

describe('SolutionsDetailComponent', () => {
  let component: SolutionsDetailComponent;
  let fixture: ComponentFixture<SolutionsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
