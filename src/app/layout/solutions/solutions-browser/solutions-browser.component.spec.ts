import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionsBrowserComponent } from './solutions-browser.component';
import { SolutionsService } from '../solutions.service';
import { VglService } from '../../../shared/modules/vgl/vgl.service';
import { UserStateService } from '../../../shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('SolutionsBrowserComponent', () => {
  let component: SolutionsBrowserComponent;
  let fixture: ComponentFixture<SolutionsBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionsBrowserComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ SolutionsService, VglService, UserStateService ]
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
