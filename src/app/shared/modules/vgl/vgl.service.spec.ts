import { TestBed, inject } from '@angular/core/testing';

import { VglService } from './vgl.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('VglService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ VglService, HttpClient, HttpHandler ]
    });
  });

  it('should be created', inject([VglService], (service: VglService) => {
    expect(service).toBeTruthy();
  }));
});
