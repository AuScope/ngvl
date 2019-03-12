import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteDatasetsModalComponent } from './remote-datasets.modal.component';

describe('RemoteDatasetsContent', () => {
  let component: RemoteDatasetsModalComponent;
  let fixture: ComponentFixture<RemoteDatasetsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteDatasetsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteDatasetsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
