import { TestBed, inject } from '@angular/core/testing';

import { SolutionsService } from './solutions.service';

describe('SolutionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolutionsService]
    });
  });

  it('should be created', inject([SolutionsService], (service: SolutionsService) => {
    expect(service).toBeTruthy();
  }));
});
