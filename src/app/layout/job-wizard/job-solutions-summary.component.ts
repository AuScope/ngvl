import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserStateService } from '../../shared';
import { Solution,
         Problem,
         Dependency,
         VarBindingType,
         Variable,
         FileVariable,
         IntegerVariable,
         DoubleVariable,
         StringVariable,
         BooleanVariable
       } from '../../shared/modules/vgl/models';

import {
  VarBinding,
  VarBindingOptions,
  DropdownBinding,
  TextboxBinding,
  NumberboxBinding,
  CheckboxBinding
} from './models';

class SolutionSummary implements Solution {
  public entryType: 'Solution';
  public '@id': string;
  public created_at: Date;
  public author: string;
  public name: string;
  public description: string;
  public url: string;
  public icon?: string;
  public problem: Problem;
  public dependencies: Dependency[];
  public template: string;
  public variables: Variable[];

  constructor(public isActive: boolean) {}

  get id(): string { return this['@id']; }
}

@Component({
  selector: 'app-job-solutions-summary',
  templateUrl: './job-solutions-summary.component.html',
  styleUrls: ['./job-solutions-summary.component.scss']
})
export class JobSolutionsSummaryComponent implements OnDestroy, OnInit {

  solutions$: Observable<SolutionSummary[]>;
  solutions: SolutionSummary[];
  activeSolution: SolutionSummary;

  varBindings: { [key: string]: VarBinding<any>[] } = {};

  private solutionsSubscription;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    this.solutions$ = this.userStateService.selectedSolutions.pipe(
      map((solutions: Solution[]) => solutions.map(solution => {
        return Object.assign(new SolutionSummary(false), solution);
      }))
    );

    this.solutionsSubscription = this.solutions$.subscribe(solutions => {
      this.solutions = solutions;
      this.mergeBindings(solutions);
    });
  }

  ngOnDestroy() {
    if (this.solutionsSubscription) {
      this.solutionsSubscription.unsubscribe();
    }
  }

  activateSolution(solution: SolutionSummary) {
    if (this.activeSolution) {
      this.activeSolution.isActive = false;
    }
    solution.isActive = true;
    this.activeSolution = solution;
  }

  updateTemplate() {
    console.log('Update the template!');
  }

  removeSolution(solution: Solution) {
    if (solution) {
      this.userStateService.removeSolutionFromCart(solution);
    }
  }

  /**
   * Reset the solution variable bindings based on the new solutions, merging in
   * any existing bindings the user has set for the given solutions.
   */
  mergeBindings(solutions: SolutionSummary[]) {
    let varBindings = {...this.varBindings};

    solutions.forEach(solution => {
      // Create default bindings for solution if none already exist
      const id = solution.id;
      if (!(id in varBindings)) {
        varBindings[id] = solution.variables.map(this.createBinding);
      }
    });

    this.varBindings = varBindings;
  }

  createBinding(v: Variable): VarBinding<any> {
    let b: VarBinding<any>;
    const options: VarBindingOptions<any> = {
      key: v.name,
      label: v.label,
      description: v.description,
      required: !v.optional
    };

    if (v.default !== undefined) {
      options.value = v.default;
    }

    if (v.values) {
      options.options = v.values;
    }

    if (v.type == "file") {
      // File inputs are always dropdowns, with options populated from the
      // current set of selected downloads.
      b = new DropdownBinding<string>(options);
    }
    else if (v.type == "int") {
      options.step = v.step || 1;
      if (v.min != null) {
        options.min = v.min;
      }
      if (v.max != null)  {
        options.max = v.max;
      }
      b = options.options ? new DropdownBinding<number>(options) : new NumberboxBinding(options);
    }
    else if (v.type == "double") {
      options.step = v.step || 0.01;
      if (v.min != null) {
        options.min = v.min;
      }
      if (v.max != null)  {
        options.max = v.max;
      }
      b = options.options ? new DropdownBinding<number>(options) : new NumberboxBinding(options);
    }
    else if (v.type == "string") {
      b = options.options ? new DropdownBinding<number>(options) : new TextboxBinding(options);
    }
    else if (v.type == "boolean") {
      b = new CheckboxBinding(options);
    }

    return b;
  }

}
