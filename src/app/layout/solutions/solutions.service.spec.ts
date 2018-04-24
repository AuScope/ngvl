import { TestBed, inject } from '@angular/core/testing';

import { SolutionsService } from './solutions.service';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('SolutionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ SolutionsService, VglService, HttpClient, HttpHandler ]
    });
  });

  it('should be created', inject([SolutionsService], (service: SolutionsService) => {
    expect(service).toBeTruthy();
  }));
});
