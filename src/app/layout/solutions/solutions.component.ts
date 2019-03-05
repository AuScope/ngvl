import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { routerTransition } from '../../router.animations';

import { UserStateService, SOLUTIONS_VIEW } from '../../shared';
import { Problem, Solution } from '../../shared/modules/vgl/models';

@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
  animations: [routerTransition()]
})
export class SolutionsComponent implements OnInit, AfterViewChecked {

  selectedProblem: Problem;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    // Notify user state that we're using the solutions view
    // this.userStateService.setView(SOLUTIONS_VIEW);

    // Subscribe to the current solution query to display relevant
    // results/selections.
    this.userStateService.solutionQuery.subscribe(query => {
      const { problems } = query;
      this.selectedProblem = problems ? problems[0] : null;
    });

  }

  selectSolution(solution: Solution) {
    this.userStateService.addSolutionToCart(solution);
  }

  ngAfterViewChecked() {
    this.userStateService.setView(SOLUTIONS_VIEW);
  }

}
