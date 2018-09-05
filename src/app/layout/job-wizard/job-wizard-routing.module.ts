import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobWizardComponent } from './job-wizard.component';

const routes: Routes = [
  { path: 'new', component: JobWizardComponent },
  { path: 'job/:id', component: JobWizardComponent },
  { path: '', redirectTo: 'new', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobWizardRoutingModule { }
