import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';

import { Solution, Problem } from './models';

@Injectable()
export class SolutionsService {

  const getSolutionsUrl = environment.portalBaseUrl + ''

  constructor(private http: HttpClient) {}

  getSolutions(): Observable<Solution[]> {
    return this.http.get<Solution[]>()
  }

}
