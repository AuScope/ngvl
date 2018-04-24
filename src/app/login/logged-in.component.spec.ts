import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggedInComponent } from './logged-in.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserStateService } from '../shared';
import { VglService } from '../shared/modules/vgl/vgl.service';


describe('LoggedInComponent', () => {
  let component: LoggedInComponent;
  let fixture: ComponentFixture<LoggedInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoggedInComponent ],
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      providers: [ UserStateService, VglService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
