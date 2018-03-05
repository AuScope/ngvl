import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export const DATA_VIEW = 'data-view';
export const SOLUTIONS_VIEW = 'solutions-view';
export const JOBS_VIEW = 'jobs-view';

export type ViewType = 'data-view' | 'solutions-view' | 'jobs-view' | null;

@Injectable()
export class UserStateService {

  constructor() {}

  private _currentView: BehaviorSubject<ViewType> = new BehaviorSubject(null);

  public readonly currentView: Observable<ViewType> = this._currentView.asObservable();

  public setView(viewType: ViewType): Observable<ViewType> {
    this._currentView.next(viewType);
    return this.currentView;
  }

}
