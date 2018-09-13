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

@Component({
  selector: 'app-job-solutions-summary',
  templateUrl: './job-solutions-summary.component.html',
  styleUrls: ['./job-solutions-summary.component.scss']
})
export class JobSolutionsSummaryComponent implements OnDestroy, OnInit {

  solutions: Solution[];
  activeSolution: string;

  template: string = '';
  varBindings: SolutionVarBindings = {};

  isTemplateEditorCollapsed = true;

  editorOptions = {
    theme: 'vs-light',
    language: 'python',

    // We don't need this enabled if we use *ngIf to show/hide the editor. With
    // ngbCollapse it is required. Resizing the browser window still works
    // either way, so prefer the slight hit of re-adding the editor component
    // each time over a busy-loop polling for changes with the below enabled.
    //
    // automaticLayout: true
  };

  private solutionsSubscription;
  private bindingsSubscription;

  constructor(private userStateService: UserStateService,
              private vbs: SolutionVarBindingsService,
              private http: HttpClient) {}

  ngOnInit() {
    this.solutionsSubscription = this.userStateService.selectedSolutions
      .subscribe(solutions => {
        // Update our solutions array
        this.solutions = solutions;

        // Merge bindings for any new solutions with existing bindings, which
        // will also update the template.
        this.mergeBindings(solutions);

        // If the user hasn't selected a solution that is in the new list then
        // select the first one by default.
        if (!this.activeSolution ||
            !this.solutions.find(s => s.id === this.activeSolution)) {
          this.activeSolution = this.solutions[0].id;
        }
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

  /**
   * Reset the solution variable bindings based on the new solutions, merging in
   * any existing bindings the user has set for the given solutions.
   */
  mergeBindings(solutions: Solution[]) {
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
