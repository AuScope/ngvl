import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../shared';
import { UserManagementComponent } from './user-management.component';
import { UserRoutingModule } from './user-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderModule,
    UserRoutingModule,
    NgbTabsetModule.forRoot()
  ],
  declarations: [ UserManagementComponent ],
  providers: [ ],
  exports: [ UserManagementComponent ]
})
export class UserModule { }
