import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { map, catchError, defaultIfEmpty } from 'rxjs/operators';

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
  CheckboxBinding,
  SolutionVarBindings
} from './models';
import { SolutionVarBindingsService } from './solution-var-bindings.service';
import { HttpClient } from '@angular/common/http';

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

  solutions: SolutionSummary[];
  activeSolution: SolutionSummary;

  template: string = '';
  varBindings: SolutionVarBindings = {};

  editorOptions = {
    theme: 'vs-light',
    language: 'python'
  };

  private solutionsSubscription;
  private bindingsSubscription;

  constructor(private userStateService: UserStateService,
              private vbs: SolutionVarBindingsService,
              private http: HttpClient) {}

  ngOnInit() {
    this.solutionsSubscription = this.userStateService.selectedSolutions.pipe(
      // Map each Solution to a SolutionSummary so we get the nice id accessor.
      map((solutions: Solution[]) => solutions.map(solution => {
        return Object.assign(new SolutionSummary(false), solution);
      }))
    ).subscribe(solutions => {
      this.solutions = solutions;
      this.mergeBindings(solutions);
    });

    this.bindingsSubscription = this.vbs.templateBindings
      .subscribe(bindings => {
        this.varBindings = bindings;
        this.updateTemplate();
      });
  }

  ngOnDestroy() {
    if (this.solutionsSubscription) {
      this.solutionsSubscription.unsubscribe();
    }
    if (this.bindingsSubscription) {
      this.bindingsSubscription.unsubscribe();
    }
  }

  activateSolution(solution: SolutionSummary) {
    if (this.activeSolution) {
      this.activeSolution.isActive = false;
    }
    solution.isActive = true;
    this.activeSolution = solution;
  }

  updateBindings(solution: Solution, bindings: VarBinding<any>[]) {
    this.vbs.updateTemplateBindings(solution, bindings);
  }

  updateTemplate() {
    // Update the current job template based on the current solutions and bindings.
    const requests = this.solutions.map(solution => this.makeRequest(solution));
    forkJoin(requests).pipe(defaultIfEmpty([])).subscribe(templates => {
      this.template = templates.join('\n\n');
    });
  }

  private subIntoTemplate(solution) {
    const bindings: VarBinding<any>[] = this.varBindings[solution.id] || [];

    return template => {
      return template.replace(/\$\{([a-zA-Z0-9_-]+)\}/g,
                              (match, p1, offset, string) => {
                                const b = bindings.find(it => it.key === p1);
                                if (b && b.value !== undefined) {
                                  return b.value;
                                }
                                return match;
                              });
    }
  }

  private makeRequest(solution: Solution): Observable<string> {
    const subf = this.subIntoTemplate(solution);

    return this.http.get(solution.template, { responseType: 'text' }).pipe(
      // Substitute current bindings for solution into template.
      map(subf),

      // Catch http errors
      catchError(err => {
        console.log('Request error in job-template-component: ' + err.message);      
        return Observable.of<string>('');
      })
    );
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

    this.vbs.updateTemplateBindings(varBindings);
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
