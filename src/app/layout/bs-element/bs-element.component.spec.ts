import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsElementComponent } from './bs-element.component';
import { PageHeaderModule } from '../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('BsElementComponent', () => {
  let component: BsElementComponent;
  let fixture: ComponentFixture<BsElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsElementComponent ],
      imports: [
          PageHeaderModule,
          RouterTestingModule,
          BrowserAnimationsModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
