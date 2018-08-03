import { TestBed, inject } from '@angular/core/testing';

import { SolutionVarBindingsFormService } from './solution-var-bindings-form.service';

describe('SolutionVarBindingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolutionVarBindingsFormService]
    });
  });

  it('should be created', inject([SolutionVarBindingsFormService], (service: SolutionVarBindingsFormService) => {
    expect(service).toBeTruthy();
  }));
});
