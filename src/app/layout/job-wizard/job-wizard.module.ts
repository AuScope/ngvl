import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobWizardRoutingModule } from './job-wizard-routing.module';
import { JobWizardComponent } from './job-wizard.component';

import { JobsModule } from '../jobs/jobs.module';
import { SolutionsModule } from '../solutions/solutions.module';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';

@NgModule({
  imports: [
    CommonModule,
    JobWizardRoutingModule,
    JobsModule,
    SolutionsModule
  ],
  declarations: [JobWizardComponent, JobSolutionsSummaryComponent],
  exports: [JobWizardComponent]
})
export class JobWizardModule { }
