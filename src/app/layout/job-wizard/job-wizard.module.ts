import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobWizardRoutingModule } from './job-wizard-routing.module';
import { JobWizardComponent } from './job-wizard.component';

import { JobsModule } from '../jobs/jobs.module';
import { SolutionsModule } from '../solutions/solutions.module';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';
import { JobObjectComponent } from './job-object.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    JobWizardRoutingModule,
    JobsModule,
    SolutionsModule
  ],
  declarations: [JobWizardComponent, JobSolutionsSummaryComponent, JobObjectComponent],
  exports: [JobWizardComponent]
})
export class JobWizardModule { }
