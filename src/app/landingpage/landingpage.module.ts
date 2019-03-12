import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingpageComponent } from './landingpage.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [LandingpageComponent]
})
export class LandingpageModule { }
