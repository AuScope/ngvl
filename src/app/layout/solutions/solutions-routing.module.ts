import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../shared';
import { SolutionsComponent } from './solutions.component';

const routes: Routes = [{ path: '', component: SolutionsComponent, canActivate: [AuthGuard]  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolutionsRoutingModule { }
