import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LandingpageComponent} from './landingpage.component';
import { LayoutComponent } from '../layout/layout.component' ;

const routes: Routes = [
  { path: '', component: LandingpageComponent },
  { path: 'vgl', loadChildren: '../layout/layout.module#LayoutModule' }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingpageRoutingModule { }
