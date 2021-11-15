import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SolutionsService } from '../solutions.service';
import { UserStateService } from '../../../shared';
import { Problem, Solution, SolutionQuery } from '../../../shared/modules/vgl/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-solutions-browser',
  templateUrl: './solutions-browser.component.html',
  styleUrls: ['./solutions-browser.component.scss']
})
export class SolutionsBrowserComponent implements OnDestroy, OnInit {

  problems: Problem[] = [];
  private _selectedProblem: Problem;

  problemIsCollapsed: boolean = false;

  solutionsLoading = false;

  private _solutionSub: Subscription;
  private _querySub: Subscription;

  constructor(
    private solutionsService: SolutionsService,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    this.solutionsLoading = true;
    console.log("Preload: " + this.solutionsLoading);
    this._solutionSub = this.solutionsService
      .getSolutions()
      .subscribe(problems => {
        this.problems = problems;
        this.solutionsLoading = false;
      }, error => {
        this.solutionsLoading = false;
        console.log(error.message)
      });

    this._querySub = this.userStateService.solutionQuery
      .subscribe((query: SolutionQuery) => {
        this._selectedProblem = (query && query.problems) ? query.problems[0] : null;
      });
  }

  ngOnDestroy() {
    this._solutionSub.unsubscribe();
    this._querySub.unsubscribe();
  }

  get selectedProblemId(): string {
    const sp = this._selectedProblem;
    return sp ? sp['@id'] : null;
  }

  set selectedProblemId(id: string) {
    const problem = this.problems.find(it => it['@id'] === id);
    this.selectedProblem = problem;
  }

  get selectedProblem(): Problem {
    return this._selectedProblem;
  }

  set selectedProblem(problem: Problem) {
    const problems = problem ? [problem] : [];
    this.userStateService.setSolutionQuery({ problems: problems });
  }

  get problemCount(): number {
    return this.problems.length;
  }

}
