import { TestBed, inject } from '@angular/core/testing';

import { UserStateService } from './user-state.service';
import { VglService } from '../modules/vgl/vgl.service';
import { HttpClient, HttpHandler } from '@angular/common/http';


describe('UserStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ UserStateService, VglService, HttpClient, HttpHandler ]
    });
  });

  it('should be created', inject([UserStateService], (service: UserStateService) => {
    expect(service).toBeTruthy();
  }));
});
