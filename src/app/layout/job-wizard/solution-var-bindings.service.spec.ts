import { TestBed, inject } from '@angular/core/testing';

import { SolutionVarBindingsService } from './solution-var-bindings-form.service';

describe('SolutionVarBindingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolutionVarBindingsService]
    });
  });

  it('should be created', inject([SolutionVarBindingsService], (service: SolutionVarBindingsService) => {
    expect(service).toBeTruthy();
  }));
});
