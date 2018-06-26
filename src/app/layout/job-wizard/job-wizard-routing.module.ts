import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobWizardComponent } from './job-wizard.component';

const routes: Routes = [
  { path: '', component: JobWizardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobWizardRoutingModule { }
