import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolutionsComponent } from './solutions.component';
import { SolutionsDetailComponent } from './solutions-detail.component';

const routes: Routes = [
  { path: '', component: SolutionsComponent },
  { path: 'detail/:id', component: SolutionsDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolutionsRoutingModule { }
