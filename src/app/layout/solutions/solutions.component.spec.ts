import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionsComponent } from './solutions.component';
import { UserStateService } from '../../shared';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

describe('SolutionsComponent', () => {
  let component: SolutionsComponent;
  let fixture: ComponentFixture<SolutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionsComponent ],
      imports: [ RouterTestingModule, BrowserAnimationsModule ],
      providers: [ UserStateService, VglService, HttpClient, HttpHandler ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
