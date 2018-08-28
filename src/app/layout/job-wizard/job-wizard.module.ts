import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { JobWizardRoutingModule } from './job-wizard-routing.module';
import { JobWizardComponent } from './job-wizard.component';

import { JobsModule } from '../jobs/jobs.module';
import { SolutionsModule } from '../solutions/solutions.module';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';
import { JobSolutionVarsComponent } from './job-solution-vars.component';
import { SolutionVarBindingComponent } from './solution-var-binding.component';
import { SolutionVarBindingsService } from './solution-var-bindings.service';
import { JobObjectComponent } from './job-object.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MonacoEditorModule.forRoot(),
    JobWizardRoutingModule,
    JobsModule,
    SolutionsModule
  ],
  declarations: [
    JobWizardComponent,
    JobSolutionsSummaryComponent,
    JobSolutionVarsComponent,
    JobObjectComponent,
    SolutionVarBindingComponent
  ],
  exports: [JobWizardComponent],
  providers: [SolutionVarBindingsService]
})
export class JobWizardModule { }
