import { TestBed, inject } from '@angular/core/testing';

import { VglService } from './vgl.service';

describe('VglService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VglService]
    });
  });

  it('should be created', inject([VglService], (service: VglService) => {
    expect(service).toBeTruthy();
  }));
});
