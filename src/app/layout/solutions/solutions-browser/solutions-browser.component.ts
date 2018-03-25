import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { SolutionsService } from '../solutions.service';

import { UserStateService } from '../../../shared';

import { Problem, Solution, SolutionQuery } from '../../../shared/modules/vgl/models';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-solutions-browser',
  templateUrl: './solutions-browser.component.html',
  styleUrls: ['./solutions-browser.component.scss']
})
export class SolutionsBrowserComponent implements OnInit {

  problems: Problem[] = [];
  selectedProblem: string;

  constructor(
    private solutionsService: SolutionsService,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    this.solutionsService.getSolutions().subscribe(problems => this.problems = problems);

    this.userStateService.solutionQuery
      .subscribe((query: SolutionQuery) => {
        this.selectedProblem = (query && query.problems) ? query.problems[0]['@id'] : null;
      });
  }

  selectProblem(id: string) {
    this.userStateService.setSolutionQuery({ problems: [this.problems.find(it => it['@id'] === id)] });
  }
}
