import { Component, OnInit } from '@angular/core';

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
export class JobSolutionsSummaryComponent implements OnInit {

  solutions$: Observable<SolutionSummary[]>;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    this.solutions$ = this.userStateService.selectedSolutions.pipe(
      map(solutions => solutions.map(solution => {
        return {...solution, isActive: true};
      }))
    );
  }

  toggleSolution(solution: SolutionSummary) {
    // Toggle the active status of the solution.
    solution.isActive = !solution.isActive;

    // Show the inputs for the active solution.

  }

}
