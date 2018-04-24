import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesComponent } from './tables.component';
import { PageHeaderModule } from '../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TablesComponent', () => {
  let component: TablesComponent;
  let fixture: ComponentFixture<TablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablesComponent ],
      imports: [ PageHeaderModule, RouterTestingModule, BrowserAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
