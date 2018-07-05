import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserStateService } from '../../shared';
import { Solution } from '../../shared/modules/vgl/models';

interface SolutionSummary extends Solution {
  isActive: boolean;
}

@Component({
  selector: 'app-job-solutions-summary',
  templateUrl: './job-solutions-summary.component.html',
  styleUrls: ['./job-solutions-summary.component.scss']
})
export class JobSolutionsSummaryComponent implements OnDestroy, OnInit {

  solutions$: Observable<SolutionSummary[]>;
  solutions: SolutionSummary[];
  activeSolution: Solution;

  private solutionsSubscription;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    this.solutions$ = this.userStateService.selectedSolutions.pipe(
      map(solutions => solutions.map(solution => {
        return {...solution, isActive: true};
      }))
    );

    this.solutionsSubscription = this.solutions$.subscribe(solutions => this.solutions = solutions);
  }

  ngOnDestroy() {
    if (this.solutionsSubscription) {
      this.solutionsSubscription.unsubscribe();
    }
  }

  activateSolution(solution: SolutionSummary) {
    this.solutions.forEach(it => {
      if (it.id === solution.id) {
        it.isActive = true;
        this.activeSolution = it;
      }
      else {
        it.isActive = false;
      }
    });
  }

  updateTemplate() {
    console.log('Update the template!');
  }

  removeSolution(solution: Solution) {
    if (solution) {
      this.userStateService.removeSolutionFromCart(solution);
    }
  }

}
