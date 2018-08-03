import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';
import { catchError, defaultIfEmpty, map, switchMap } from 'rxjs/operators';

import { Solution } from '../../shared/modules/vgl/models';
import { UserStateService } from '../../shared';

@Component({
  selector: 'app-job-template',
  templateUrl: './job-template.component.html',
  styleUrls: ['./job-template.component.scss']
})
export class JobTemplateComponent implements OnInit, OnDestroy {

  editorOptions = {
    theme: 'vs-light',
    language: 'python'
  };
  template: string = '';

  private subscription;

  constructor(private userStateService: UserStateService,
              private http: HttpClient) {}

  ngOnInit() {
    this.subscription = this.userStateService.selectedSolutions.pipe(
      map(solutions => solutions.map(this.makeRequest()))
    ).subscribe(requests => {
      forkJoin(requests).pipe(defaultIfEmpty([])).subscribe(templates => {
        this.template = templates.join('\n\n');
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private makeRequest(): (solution: Solution) => Observable<string> {
    return solution =>
      this.http.get(solution.template, { responseType: 'text' }).pipe(
        catchError(err => {
          console.log('Request error in job-template-component: ' + err.error.error.message);
          return of<string>('');
        })
      );
  }
}
