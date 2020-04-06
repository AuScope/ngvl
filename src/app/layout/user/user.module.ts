import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared';
import { UserManagementComponent } from './user-management.component';
import { UserRoutingModule } from './user-routing.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderModule,
    UserRoutingModule,
    NgbNavModule,
    ToastModule
  ],
  declarations: [ UserManagementComponent ],
  providers: [ MessageService ],
  exports: [ UserManagementComponent ]
})
export class UserModule { }
