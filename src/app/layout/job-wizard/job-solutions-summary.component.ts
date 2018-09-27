import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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

import { VarBinding,
         VarBindingOptions,
         SolutionVarBindings
       } from '../../shared/modules/solutions/models';

import { SolutionVarBindingsService } from './solution-var-bindings.service';

@Component({
  selector: 'app-job-solutions-summary',
  templateUrl: './job-solutions-summary.component.html',
  styleUrls: ['./job-solutions-summary.component.scss']
})
export class JobSolutionsSummaryComponent implements OnDestroy, OnInit {

  solutions: Solution[];
  activeSolution: string;

  template$: Observable<string>;

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
              private modalService: NgbModal) {}

  ngOnInit() {
    this.solutionsSubscription = this.userStateService.selectedSolutions
      .subscribe(solutions => {
        // Update our solutions array
        this.solutions = solutions;

        // If the user hasn't selected a solution that is in the new list then
        // select the first one by default.
        if (this.solutions && this.solutions.length > 0) {
          if (!this.activeSolution ||
              !this.solutions.find(s => s.id === this.activeSolution)) {
            this.activeSolution = this.solutions[0].id;
          }
        }
      });

    this.bindingsSubscription = this.userStateService.solutionBindings
      .subscribe(bindings => {
        this.varBindings = bindings;
      });

    this.template$ = this.userStateService.jobTemplate;
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
    this.userStateService.updateSolutionBindings(solution, bindings);
  }

  updateTemplate(template: string) {
    this.userStateService.updateJobTemplate(template);
  }

  resetTemplate() {
    this.userStateService.resetJobTemplate();
  }

  open() {
    const modalRef = this.modalService.open(FinalTemplateModal);
    modalRef.componentInstance.template = this.userStateService.getJobTemplateWithVars();
  }

}

@Component({
  selector: 'final-template-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Final template</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <ngx-monaco-editor [options]="editorOptions" [ngModel]="template"></ngx-monaco-editor>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close()">Close</button>
    </div>
  `
})
export class FinalTemplateModal {
  @Input() template: string;

  editorOptions = {
    theme: 'vs-light',
    language: 'python',
    readOnly: true
  };

  constructor(public activeModal: NgbActiveModal) {}
}
