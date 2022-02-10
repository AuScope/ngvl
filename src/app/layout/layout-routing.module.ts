import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'data', loadChildren: './datasets/datasets.module#DatasetsModule' },
      { path: 'solutions', loadChildren: './solutions/solutions.module#SolutionsModule', canActivate: [AuthGuard] },
      { path: 'jobs', loadChildren: './jobs/jobs.module#JobsModule', canActivate: [AuthGuard] },
      { path: 'wizard', loadChildren: './job-wizard/job-wizard.module#JobWizardModule', canActivate: [AuthGuard]},
      { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
      { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
      { path: 'forms', loadChildren: './form/form.module#FormModule' },
      { path: 'bs-element', loadChildren: './bs-element/bs-element.module#BsElementModule' },
      { path: 'grid', loadChildren: './grid/grid.module#GridModule' },
      { path: 'components', loadChildren: './bs-component/bs-component.module#BsComponentModule' },
      { path: 'blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
      { path: 'user', loadChildren: './user/user.module#UserModule'},
      { path: 'help', loadChildren: './help/help.module#HelpModule' },
      { path: '', redirectTo: '/landing', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
