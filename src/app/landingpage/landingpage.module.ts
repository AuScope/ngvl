import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingpageRoutingModule } from './landingpage-routing.module';
import { LandingpageComponent } from './landingpage.component';

@NgModule({
  imports: [
    CommonModule,
    LandingpageRoutingModule
  ],
  declarations: [LandingpageComponent]  
})
export class LandingpageModule { }
