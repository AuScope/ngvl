import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { NgbCarouselModule, NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StatModule } from '../../shared';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent, NgbCarouselModule.forRoot(), NgbAlertModule.forRoot(), StatModule ],
      imports: [ NgbModule.forRoot() ]
    })
    .compileComponents();
  }));

  // TODO: Fix below to solve the very helpful error:
  // Failed: Unexpected value '[object Object]' declared by the module 'DynamicTestModule'
  /*
  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
