import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { LoggedInComponent } from './logged-in.component';


@NgModule({
    imports: [CommonModule, LoginRoutingModule, TranslateModule],
    declarations: [LoginComponent, LoggedInComponent]
})
export class LoginModule {}
