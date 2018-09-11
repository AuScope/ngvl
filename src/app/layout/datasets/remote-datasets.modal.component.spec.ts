import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteDatasetsModalContent } from './remote-datasets.modal.component';

describe('RemoteDatasetsContent', () => {
  let component: RemoteDatasetsModalContent;
  let fixture: ComponentFixture<RemoteDatasetsModalContent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteDatasetsModalContent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteDatasetsModalContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
