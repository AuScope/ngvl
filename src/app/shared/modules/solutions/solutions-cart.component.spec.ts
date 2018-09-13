import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionsCartComponent } from './solutions-cart.component';

describe('SolutionsCartComponent', () => {
  let component: SolutionsCartComponent;
  let fixture: ComponentFixture<SolutionsCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionsCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionsCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
